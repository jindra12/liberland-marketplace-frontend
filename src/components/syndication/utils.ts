export const getPublishListingsTagInfo = (canCreateContent: boolean) => {
    return canCreateContent
        ? {
              color: "success" as const,
              label: "Can publish listings",
          }
        : {
              color: "default" as const,
              label: "Cannot publish listings",
          };
};
