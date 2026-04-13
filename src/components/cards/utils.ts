export const getRemainingDocs = (totalDocs: number | undefined, itemCount: number) => {
    return totalDocs !== undefined ? totalDocs - itemCount : 0;
};
