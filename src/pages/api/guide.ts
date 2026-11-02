/* eslint-disable import/no-default-export */
import type { NextApiRequest, NextApiResponse } from "next";
import guide from "../../../public/LLM.md";

const handler = (request: NextApiRequest, response: NextApiResponse) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
        response.setHeader("Allow", "GET, HEAD");
        response.status(405).json({ error: "Use GET to read the marketplace guide." });
        return;
    }
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "public, max-age=3600");
    response.status(200).send(request.method === "HEAD" ? "" : guide);
};

export default handler;
