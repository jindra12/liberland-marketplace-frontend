import { User } from "oidc-client-ts";

import { BACKEND_URL } from "../../../src/gqlFetcher";
import { buildAuthAuthority, buildAuthStorageKey } from "../../../src/components/auth/utils";

export const seedAuthorizedProfile = (win: Window, serverUrl: string, emailVerified = true) => {
    const now = Math.floor(Date.now() / 1000);
    const user = new User({
        access_token: "mock-profile-access-token",
        token_type: "Bearer",
        scope: "openid profile email",
        expires_at: now + 3600,
        profile: {
            iss: `${BACKEND_URL}/api/auth`,
            aud: "frontend-app",
            exp: now + 3600,
            iat: now,
            sub: "user-nova",
            email: "nova@example.test",
            email_verified: emailVerified,
            name: "Nova Rivers",
            picture: "https://example.test/nova.png",
        },
    });

    win.localStorage.setItem(
        buildAuthStorageKey(buildAuthAuthority(serverUrl), process.env.REACT_APP_OIDC_CLIENT_ID || ""),
        user.toStorageString(),
    );
    return user;
};
