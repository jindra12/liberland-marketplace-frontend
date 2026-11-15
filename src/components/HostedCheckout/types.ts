import type { z } from "zod";
import type { hostedSessionSchema } from "./utils";

export type HostedSession = z.infer<typeof hostedSessionSchema>;
