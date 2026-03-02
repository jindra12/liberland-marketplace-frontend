import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { BACKEND_URL, getAccessToken } from "./gqlFetcher";

const ventureClient = () => {
    const token = getAccessToken();
    return axios.create({
        baseURL: `${BACKEND_URL}/api/startups`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
};

export const useJoinVentureMutation = () =>
    useMutation({
        mutationFn: (ventureId: string) =>
            ventureClient().post(`/${ventureId}/join`),
    });

export const useLeaveVentureMutation = () =>
    useMutation({
        mutationFn: (ventureId: string) =>
            ventureClient().post(`/${ventureId}/leave`),
    });
