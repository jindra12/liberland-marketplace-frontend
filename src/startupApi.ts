import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { BACKEND_URL, getAccessToken } from "./gqlFetcher";

const startupClient = (url: string) => {
    const token = getAccessToken(url);
    return axios.create({
        baseURL: `${BACKEND_URL}/api/startups`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
};

export const useJoinStartupMutation = () =>
    useMutation({
        mutationFn: (vars: { url: string; startupId: string; }) =>
            startupClient(vars.url).post(`/${vars.startupId}/join`),
    });

export const useLeaveStartupMutation = () =>
    useMutation({
        mutationFn: (vars: { url: string; startupId: string; }) =>
            startupClient(vars.url).post(`/${vars.startupId}/leave`),
    });
