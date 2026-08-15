import { createHash } from "crypto";
import { normalizeBackendUrl } from "./backend";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
type Session = { servers: string[]; expiresAt: number };
const sessions = new Map<string, Session>();

const getSessionKey = (authorization: string): string => createHash("sha256").update(authorization).digest("hex");

const getOrCreateSession = (authorization: string): Session => {
    const key = getSessionKey(authorization);
    const existing = sessions.get(key);
    if (existing && existing.expiresAt > Date.now()) return existing;
    const session = { servers: [], expiresAt: Date.now() + SESSION_TTL_MS };
    sessions.set(key, session);
    return session;
};

export const addSyndicatedServer = (authorization: string, serverUrl: string): string[] => {
    const session = getOrCreateSession(authorization);
    const normalized = normalizeBackendUrl(serverUrl);
    if (!session.servers.includes(normalized)) session.servers.push(normalized);
    return session.servers;
};

export const removeSyndicatedServer = (authorization: string, serverUrl: string): string[] => {
    const session = getOrCreateSession(authorization);
    const normalized = normalizeBackendUrl(serverUrl);
    session.servers = session.servers.filter((entry) => entry !== normalized);
    return session.servers;
};

export const listSyndicatedServers = (authorization?: string): string[] => authorization ? getOrCreateSession(authorization).servers : [];
