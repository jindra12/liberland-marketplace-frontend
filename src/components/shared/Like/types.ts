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
    mutate: (variables: LikeMutationVariables, options?: { onError: (error: unknown) => void }) => void;
};

export type DislikeMutation = {
    isPending?: boolean;
    mutate: (variables: DislikeMutationVariables, options?: { onError: (error: unknown) => void }) => void;
};

export interface OptimisticLikeState {
    id: string;
    serverURL?: string | null;
    baselineLiked: boolean;
    baselineCount: number;
    liked: boolean;
    count: number;
}
