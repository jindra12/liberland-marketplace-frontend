import axios from "axios";
import { BACKEND_URL, getAccessToken } from "./gqlFetcher";

const authClient = () => {
    const token = getAccessToken();
    return axios.create({
        baseURL: `${BACKEND_URL}/api/auth`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
};

export const changePassword = (currentPassword: string, newPassword: string) =>
    authClient().post("/change-password", { currentPassword, newPassword });

export const sendVerificationEmail = (email: string) =>
    authClient().post("/send-verification-email", { email });

export const updateUserName = (name: string) =>
    authClient().post("/update-user", { name });
