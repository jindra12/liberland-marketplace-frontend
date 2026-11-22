import { useNavigate } from "react-router-dom";

import { useMutation } from "@tanstack/react-query";

import { useCompanyByIdQuery } from "../hooks";

import { createHostedSession } from "./utils";

export const useHostedCheckout = (serverUrl: string, companyId: string, productId: string | null, quantity: number) => {
    const navigate = useNavigate();
    const company = useCompanyByIdQuery({ id: companyId, url: serverUrl });
    const payment = useMutation({
        mutationFn: (values: { amount?: number }) =>
            createHostedSession(
                serverUrl,
                companyId,
                productId,
                quantity,
                values.amount === undefined ? undefined : Math.round(values.amount * 100),
            ),
        onSuccess: (session) => {
            const query = new URLSearchParams({ serverUrl, session: session.sessionId });
            navigate(`/pay?${query}`);
        },
    });

    return { company, payment };
};
