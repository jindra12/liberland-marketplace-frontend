import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const authClient = (url: string) => {
    return axios.create({
        baseURL: `${url}/api/auth`,
        withCredentials: true,
    });
};

const changePassword = (url: string, currentPassword: string, newPassword: string) =>
    authClient(url).post("/change-password", { currentPassword, newPassword });

const sendVerificationEmail = (url: string, email: string) =>
    authClient(url).post("/send-verification-email", { email });

export const useChangePasswordMutation = () =>
    useMutation({
        mutationFn: (vars: { url: string; currentPassword: string; newPassword: string }) =>
            changePassword(vars.url, vars.currentPassword, vars.newPassword),
    });

export const useSendVerificationEmailMutation = () =>
    useMutation({ mutationFn: (vars: { url: string; email: string }) => sendVerificationEmail(vars.url, vars.email) });
