import process from "process";
import { Buffer } from "buffer";

globalThis.process = process;
process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_ROUTE = "true";

if (typeof globalThis.Buffer === "undefined") {
    globalThis.Buffer = Buffer;
}

import "../src/index.scss";
