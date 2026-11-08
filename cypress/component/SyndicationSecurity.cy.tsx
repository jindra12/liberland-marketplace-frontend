import axios from "axios";
import { uploadMedia } from "../../src/mediaApi";
import { createEndpointEntry, enableOrInsertEndpoint, mergeSyndicationUrls } from "../../src/components/endpoints/utils";

describe("Syndication trust and credential routing", { retries: 0 }, () => {
    it("keeps upload credentials paired with their owning backend", () => {
        const source = "https://other-market.example";
        const post = cy.stub(axios, "post").resolves({ data: { doc: { id: "media", url: "/media/photo.png" } } });
        cy.window().then(async (win) => {
            win.localStorage.setItem(`oidc.user:${source}/api/auth:${process.env.REACT_APP_OIDC_CLIENT_ID || ""}`,
                JSON.stringify({ access_token: "selected-backend-token", expires_at: Math.floor(Date.now() / 1000) + 3600 }));
            await uploadMedia(source, new File(["fixture"], "photo.png", { type: "image/png" }));
            expect(post.callCount).to.equal(1);
            expect(post.firstCall.args[0]).to.equal(`${source}/api/media`);
            expect(post.firstCall.args[2].headers).to.deep.equal({ Authorization: "Bearer selected-backend-token" });
        });
    });

    it("requires explicit peer activation and preserves user trust decisions across directory refreshes", () => {
        const trusted = createEndpointEntry("https://trusted.example", { name: "Trusted operator" });
        const suggested = "https://suggested.example";
        const discovered = mergeSyndicationUrls([trusted], [
            { url: trusted.value, name: "Impersonated operator", nsfw: false },
            { url: suggested, autoEnable: true },
        ]);
        expect(discovered.filter((entry) => entry.enabled)).to.deep.equal([trusted]);

        const approved = enableOrInsertEndpoint(discovered, suggested);
        const refreshed = mergeSyndicationUrls(approved, [
            { url: suggested, name: "Replacement operator", autoEnable: false },
            { url: "https://another-peer.example", autoEnable: true },
        ]);
        expect(refreshed.filter((entry) => entry.enabled)).to.deep.equal(approved);
        expect(refreshed.find((entry) => entry.value === suggested)).to.deep.equal(approved[1]);
        expect(refreshed[2].enabled).to.equal(false);
    });
});
