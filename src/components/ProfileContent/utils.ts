import { getAccessToken } from "../../gqlFetcher";
import type { URL as EndpointURL } from "../../types";
import type {
    ProfileContactFormValues,
    ProfileContactUpdateInput,
    ProfileSelectedUser,
    ProfileServerOption,
} from "./types";

const toServerLabel = (url: string, name?: string) => {
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.replace(/^www\./i, "");
        return name ? `${name} (${hostname})` : hostname;
    } catch {
        return name || url;
    }
};

export const buildProfileServerOptions = (urls: EndpointURL[], authUrl: string): ProfileServerOption[] => {
    const authenticatedServers = urls.filter(({ value }) => Boolean(getAccessToken(value)));
    const sourceUrls = authenticatedServers.length > 0
        ? authenticatedServers
        : [{ value: authUrl, name: "Current server", enabled: true }];

    return sourceUrls.reduce<ProfileServerOption[]>((options, server) => {
        if (options.some(({ value }) => value === server.value)) {
            return options;
        }

        return [
            ...options,
            {
                value: server.value,
                label: toServerLabel(server.value, server.name),
            },
        ];
    }, []);
};

export const findSelectedServerLabel = (options: ProfileServerOption[], selectedServerUrl: string) => {
    return options.find(({ value }) => value === selectedServerUrl)?.label || selectedServerUrl;
};

export const validateSelectedProfileServerUrl = async (selectedServerUrl: string) => {
    if (!selectedServerUrl) {
        throw new Error("Select a server first");
    }
};

export const validateSelectedProfileServerUser = async (
    selectedServerUrl: string,
    selectedServerUserId?: string,
) => {
    await validateSelectedProfileServerUrl(selectedServerUrl);

    if (!selectedServerUserId) {
        throw new Error("Unable to load your account for the selected server");
    }
};

export const buildProfileContactFormValues = (user?: ProfileSelectedUser | null): ProfileContactFormValues => {
    return {
        phone: user?.phone || user?.shippingAddress?.phone,
        shippingAddress: {
            addressLine1: user?.shippingAddress?.addressLine1,
            addressLine2: user?.shippingAddress?.addressLine2,
            city: user?.shippingAddress?.city,
            country: user?.shippingAddress?.country,
            postalCode: user?.shippingAddress?.postalCode,
            state: user?.shippingAddress?.state,
        },
    };
};

export const buildProfileContactUpdateInput = (
    values: ProfileContactFormValues,
    user?: ProfileSelectedUser | null,
): ProfileContactUpdateInput => {
    const currentShippingAddress = user?.shippingAddress;

    return {
        phone: values.phone,
        shippingAddress: {
            title: currentShippingAddress?.title,
            firstName: currentShippingAddress?.firstName,
            lastName: currentShippingAddress?.lastName,
            company: currentShippingAddress?.company,
            addressLine1: currentShippingAddress?.addressLine1,
            addressLine2: currentShippingAddress?.addressLine2,
            city: currentShippingAddress?.city,
            state: currentShippingAddress?.state,
            postalCode: currentShippingAddress?.postalCode,
            country: currentShippingAddress?.country,
            ...values.shippingAddress,
            phone: values.phone,
        },
    };
};
