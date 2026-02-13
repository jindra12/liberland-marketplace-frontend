import { BACKEND_URL } from "./gqlFetcher";

const OIDC_CLIENT_ID = process.env.REACT_APP_OIDC_CLIENT_ID || "";
const OIDC_CLIENT_SECRET = process.env.REACT_APP_OIDC_CLIENT_SECRET || "";
const OIDC_REDIRECT_URI =
    process.env.REACT_APP_OIDC_REDIRECT_URI ||
    `${window.location.origin}/auth/callback`;

const AUTHORIZE_ENDPOINT = `${BACKEND_URL}/api/auth/oauth2/authorize`;
const TOKEN_ENDPOINT = `${BACKEND_URL}/api/auth/oauth2/token`;
const USERINFO_ENDPOINT = `${BACKEND_URL}/api/auth/oauth2/userinfo`;

function base64urlEncode(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return base64urlEncode(array.buffer);
}

export async function generatePKCE() {
    const codeVerifier = generateRandomString(32);
    const encoded = new TextEncoder().encode(codeVerifier);
    const digest = await crypto.subtle.digest("SHA-256", encoded);
    const codeChallenge = base64urlEncode(digest);
    return { codeVerifier, codeChallenge };
}

export function buildAuthorizeURL(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
        response_type: "code",
        client_id: OIDC_CLIENT_ID,
        redirect_uri: OIDC_REDIRECT_URI,
        scope: "openid profile email",
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
    });
    return `${AUTHORIZE_ENDPOINT}?${params.toString()}`;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    id_token?: string;
    refresh_token?: string;
    scope: string;
}

export async function exchangeCode(code: string, codeVerifier: string): Promise<TokenResponse> {
    const body = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: OIDC_REDIRECT_URI,
        client_id: OIDC_CLIENT_ID,
        client_secret: OIDC_CLIENT_SECRET,
        code_verifier: codeVerifier,
    });

    const res = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Token exchange failed: ${res.status} ${text}`);
    }

    return res.json();
}

export interface OIDCUser {
    sub: string;
    name?: string;
    email?: string;
    picture?: string;
}

export function decodeIdToken(idToken: string): OIDCUser {
    const payload = idToken.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const claims = JSON.parse(json);
    return {
        sub: claims.sub,
        name: claims.name,
        email: claims.email,
        picture: claims.picture,
    };
}

export async function fetchUserInfo(accessToken: string): Promise<OIDCUser> {
    const res = await fetch(USERINFO_ENDPOINT, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
        throw new Error(`UserInfo fetch failed: ${res.status}`);
    }

    return res.json();
}
