import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { BACKEND_URL, getAccessToken } from "./gqlFetcher";

const startupClient = () => {
    const token = getAccessToken();
    return axios.create({
        baseURL: `${BACKEND_URL}/api/startups`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
};

export const useJoinStartupMutation = () =>
    useMutation({
        mutationFn: (startupId: string) =>
            startupClient().post(`/${startupId}/join`),
    });

export const useLeaveStartupMutation = () =>
    useMutation({
        mutationFn: (startupId: string) =>
            startupClient().post(`/${startupId}/leave`),
    });
