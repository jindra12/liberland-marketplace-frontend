import { BACKEND_URL } from "../../../src/gqlFetcher";

let mediaUploadCount = 0;

const nextMediaDoc = () => {
    mediaUploadCount += 1;
    const id = `media-upload-${mediaUploadCount}`;

    return {
        id,
        url: `/images/${id}.png`,
        alt: "Uploaded image",
        filename: `${id}.png`,
        mimeType: "image/png",
        width: 1,
        height: 1,
    };
};

export const resetMediaUploadMock = () => {
    mediaUploadCount = 0;
};

export const installMediaUploadMock = () => {
    cy.intercept("OPTIONS", /http:\/\/127\.0\.0\.1:301[01]\/api\/media$/, (req) => {
        const origin = typeof req.headers.origin === "string" ? req.headers.origin : "*";

        req.reply({
            statusCode: 204,
            headers: {
                "access-control-allow-origin": origin,
                "access-control-allow-methods": "POST, OPTIONS",
                "access-control-allow-headers": "content-type, authorization, x-requested-with",
                "access-control-max-age": "86400",
            },
        });
    });

    cy.intercept("POST", `${BACKEND_URL}/api/media`, (req) => {
        req.alias = "mediaUpload";
        req.reply({
            statusCode: 200,
            body: {
                doc: nextMediaDoc(),
            },
        });
    });
};
