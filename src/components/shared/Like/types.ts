export type LikeMutationVariables = {
    id: string;
    liked: boolean;
    url?: string | null;
};

export type DislikeMutationVariables = {
    id: string;
    url?: string | null;
};

export type LikeMutation = {
    isPending?: boolean;
    mutate: (variables: LikeMutationVariables) => void;
};

export type DislikeMutation = {
    isPending?: boolean;
    mutate: (variables: DislikeMutationVariables) => void;
};
