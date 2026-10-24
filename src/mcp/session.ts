import { createHash } from "crypto";
import { normalizeBackendUrl } from "./backend";
import { MAX_SESSIONS, MAX_SERVERS_PER_SESSION, SESSION_TTL_MS } from "../server/security/constants";

type Session = { servers: string[]; expiresAt: number };
const sessions = new Map<string, Session>();

const pruneExpiredSessions = (): void => {
    sessions.forEach((session, key) => {
        if (session.expiresAt <= Date.now()) {
            sessions.delete(key);
        }
    });
};

const getSessionKey = (authorization: string): string => createHash("sha256").update(authorization).digest("hex");

const getOrCreateSession = (authorization: string): Session => {
    pruneExpiredSessions();
    const key = getSessionKey(authorization);
    const existing = sessions.get(key);
    if (existing && existing.expiresAt > Date.now()) {
        return existing;
    }
    if (sessions.size >= MAX_SESSIONS) {
        throw new Error("The session cache is full. Please retry later.");
    }
    const session = { servers: [], expiresAt: Date.now() + SESSION_TTL_MS };
    sessions.set(key, session);
    return session;
};

export const addSyndicatedServer = (authorization: string, serverUrl: string): string[] => {
    const normalized = normalizeBackendUrl(serverUrl);
    const session = getOrCreateSession(authorization);
    if (!session.servers.includes(normalized) && session.servers.length >= MAX_SERVERS_PER_SESSION) {
        throw new Error(`A session can contain at most ${MAX_SERVERS_PER_SESSION} backends.`);
    }
    if (!session.servers.includes(normalized)) {
        session.servers.push(normalized);
    }
    return session.servers;
};

export const removeSyndicatedServer = (authorization: string, serverUrl: string): string[] => {
    pruneExpiredSessions();
    const session = sessions.get(getSessionKey(authorization));
    if (!session) {
        return [];
    }
    const normalized = normalizeBackendUrl(serverUrl);
    session.servers = session.servers.filter((entry) => entry !== normalized);
    return session.servers;
};

export const listSyndicatedServers = (authorization?: string): string[] => {
    pruneExpiredSessions();
    return authorization ? sessions.get(getSessionKey(authorization))?.servers ?? [] : [];
};
