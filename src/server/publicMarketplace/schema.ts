import { z } from "zod";
import { MCP_ENTITIES } from "../../mcp/types";
import { normalizePublicBackendUrl } from "../security/utils";
import { MAX_PUBLIC_BACKENDS, PUBLIC_MARKETPLACE_ENTITIES } from "./constants";

/** Validate and normalize a public backend URL; failures become request validation errors. */
const backendUrl = z
    .string()
    .max(2048)
    .transform((value, context) => {
        try {
            return normalizePublicBackendUrl(value);
        } catch (error) {
            context.issues.push({
                code: "custom",
                input: value,
                message: error instanceof Error ? error.message : "Invalid public backend URL.",
            });
            return z.NEVER;
        }
    });
// Ordinary reads may target several backends; recursive discovery takes a single root below.
const common = z.object({
    serverUrl: z.union([backendUrl, z.array(backendUrl).min(1).max(MAX_PUBLIC_BACKENDS)]).optional(),
});
const entity = z.enum(PUBLIC_MARKETPLACE_ENTITIES);
const page = z
    .string()
    .regex(/^[1-9]\d*$/)
    .pipe(z.coerce.number<string>().int().max(10000))
    .default(1);
const limit = z
    .string()
    .regex(/^[1-9]\d*$/)
    .pipe(z.coerce.number<string>().int().max(100))
    .default(20);
// URL query parameters arrive as strings. Decode filters here; backend schemas validate their fields/operators.
const where = z
    .string()
    .max(8000)
    .transform((value, context) => {
        try {
            return JSON.parse(value);
        } catch {
            context.issues.push({ code: "custom", input: value, message: "where must contain a JSON object." });
            return z.NEVER;
        }
    })
    .pipe(z.record(z.string(), z.json()))
    .optional();
const listing = common.extend({ entity, page, limit, where });
const query = z.string().min(1).max(200);

/** Select the allowed query parameters by operation; unknown fields and private record collections are rejected. */
export const publicMarketplaceSchema = z.discriminatedUnion("operation", [
    listing.extend({ operation: z.literal("list"), search: query.optional() }).strict(),
    listing.extend({ operation: z.literal("search"), query }).strict(),
    common.extend({ operation: z.literal("get"), entity, id: z.string().min(1).max(100) }).strict(),
    common
        .extend({
            operation: z.literal("related"),
            entity,
            relatedEntity: entity,
            relatedField: z
                .string()
                .regex(/^[A-Za-z][A-Za-z0-9_]*$/)
                .max(100),
            relatedId: z.string().min(1).max(100),
            page,
            limit,
        })
        .strict(),
    common.extend({ operation: z.literal("compare"), query, limit, where }).strict(),
    common.extend({ operation: z.literal("schema"), entity: z.enum(MCP_ENTITIES) }).strict(),
    common.extend({ operation: z.literal("backend") }).strict(),
    z.object({ operation: z.literal("servers"), serverUrl: backendUrl.optional() }).strict(),
]);

/** compare_products wraps its backend result in a one-element fan-out array for each selected source. */
export const comparisonResultSchema = z
    .array(z.object({ result: z.json().optional(), error: z.string().optional() }))
    .length(1);

/** Detect continuation information without constraining the entity-specific record fields. */
export const listingPaginationSchema = z.object({ hasNextPage: z.boolean() });

/** Validate decoded MCP payloads as JSON before exposing them through the HTTP response. */
export const jsonValueSchema = z.json();
