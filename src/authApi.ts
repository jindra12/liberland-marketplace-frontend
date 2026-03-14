import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { getAccessToken } from "./gqlFetcher";

const authClient = (url: string) => {
    const token = getAccessToken(url);
    return axios.create({
        baseURL: `${url}/api/auth`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
};

const changePassword = (url: string, currentPassword: string, newPassword: string) =>
    authClient(url).post("/change-password", { currentPassword, newPassword });

const sendVerificationEmail = (url: string, email: string) =>
    authClient(url).post("/send-verification-email", { email });

const updateUserName = (url: string, name: string) =>
    authClient(url).post("/update-user", { name });

export const useChangePasswordMutation = () =>
    useMutation({ mutationFn: (vars: { url: string; currentPassword: string; newPassword: string }) => changePassword(vars.url, vars.currentPassword, vars.newPassword) });

export const useSendVerificationEmailMutation = () =>
    useMutation({ mutationFn: (vars: { url: string; email: string; }) => sendVerificationEmail(vars.url, vars.email) });

export const useUpdateUserNameMutation = () =>
    useMutation({ mutationFn: (vars: { url: string; name: string }) => updateUserName(vars.url, vars.name) });
