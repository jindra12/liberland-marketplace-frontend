export const getLikeButtonClassName = (className?: string, liked?: boolean | null, loading?: boolean) =>
    [
        "LikeButton",
        liked === true ? "LikeButton--liked" : "LikeButton--unliked",
        loading === true ? "LikeButton--loading" : undefined,
        className,
    ]
        .filter(Boolean)
        .join(" ");

export const getLikeCountText = (likeCount: number) => likeCount.toLocaleString("en-US");

export const getLikeButtonVariables = (
    id: string,
    serverURL?: string | null,
): {
    id: string;
    url?: string | null;
} => (serverURL === null || serverURL === undefined ? { id } : { id, url: serverURL });
