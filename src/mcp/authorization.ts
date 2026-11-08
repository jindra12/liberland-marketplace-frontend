import { z } from "zod";
import { normalizePublicBackendUrl, publicBackendFetch } from "../server/security/utils";

export const verifyBackendAuthorization = async (authorization: string, serverUrl: string): Promise<boolean> => {
    if (!/^Bearer \S+$/i.test(authorization)) {
        return false;
    }
    const response = await publicBackendFetch(`${normalizePublicBackendUrl(serverUrl)}/api/auth/oauth2/userinfo`, {
        headers: { Authorization: authorization },
    });
    if (response.status === 401 || response.status === 403) {
        return false;
    }
    if (!response.ok) {
        throw new Error("The authentication backend is temporarily unavailable.");
    }
    const user = z.object({ sub: z.string().min(1) }).safeParse(await response.json());
    if (!user.success) {
        throw new Error("The authentication backend returned invalid user information.");
    }
    return true;
};
