import process from "process";
import { Buffer } from "buffer";
import "../src/index.scss";

globalThis.process = process;
process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_ROUTE = "true";
process.env.REACT_APP_HELIUS = "http://127.0.0.1:8899";
process.env.REACT_APP_THIRDWEB = "test-thirdweb-client-id";
process.env.REACT_APP_THRIDWEB = "test-thirdweb-client-id";

if (typeof globalThis.Buffer === "undefined") {
    globalThis.Buffer = Buffer;
}
