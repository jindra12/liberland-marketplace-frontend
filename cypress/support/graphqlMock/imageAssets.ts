import type { Media } from "../../../src/generated/graphql";
import type { User } from "../../../src/generated/graphql";

const IMAGE_ORIGIN = "http://localhost:8080";
const IMAGE_OWNER: User = {
    id: "image-owner",
    name: "Image Owner",
    email: "image-owner@example.test",
    emailVerified: true,
};

export type MockImageKind = "avatar" | "hero";

export const buildMockImageNode = (id: string, alt: string, kind: MockImageKind = "avatar"): Media => {
    const isHero = kind === "hero";

    return {
        id,
        url: isHero ? `${IMAGE_ORIGIN}/hero/nswap-hero-bg.svg` : `${IMAGE_ORIGIN}/preview-image.png`,
        alt,
        filename: isHero ? "nswap-hero-bg.svg" : "preview-image.png",
        mimeType: isHero ? "image/svg+xml" : "image/png",
        width: isHero ? 1600 : 1200,
        height: isHero ? 900 : 800,
        createdBy: IMAGE_OWNER,
    };
};
