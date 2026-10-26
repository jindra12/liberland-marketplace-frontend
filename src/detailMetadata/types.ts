import type { CompanyByIdQuery, IdentityByIdQuery, ProductByIdQuery } from "../generated/graphql";
import type { OfferLeaf } from "schema-dts";

export type MetadataCompany = Pick<NonNullable<CompanyByIdQuery["Company"]>, "id" | "name" | "description" | "serverURL" | "website" | "identity">;
export type MetadataTribe = Pick<NonNullable<IdentityByIdQuery["Identity"]>, "id" | "name" | "description" | "serverURL" | "website">;
export type MetadataProduct = Pick<NonNullable<ProductByIdQuery["Product"]>, "company" | "inventory" | "orderable" | "url" | "priceInUSDEnabled" | "priceInUSD" | "priceInETH" | "priceInSOL" | "priceInTRX">;

export type MetadataRelationships = {
    company?: MetadataCompany | null;
    identity?: MetadataTribe | null;
    offers?: OfferLeaf[];
};
