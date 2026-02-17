import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { BACKEND_URL, getAccessToken } from "./gqlFetcher";

const authClient = () => {
    const token = getAccessToken();
    return axios.create({
        baseURL: `${BACKEND_URL}/api/auth`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
};

const changePassword = (currentPassword: string, newPassword: string) =>
    authClient().post("/change-password", { currentPassword, newPassword });

const sendVerificationEmail = (email: string) =>
    authClient().post("/send-verification-email", { email });

const updateUserName = (name: string) =>
    authClient().post("/update-user", { name });

export const useChangePasswordMutation = () =>
    useMutation({ mutationFn: (vars: { currentPassword: string; newPassword: string }) => changePassword(vars.currentPassword, vars.newPassword) });

export const useSendVerificationEmailMutation = () =>
    useMutation({ mutationFn: (email: string) => sendVerificationEmail(email) });

export const useUpdateUserNameMutation = () =>
    useMutation({ mutationFn: (name: string) => updateUserName(name) });
