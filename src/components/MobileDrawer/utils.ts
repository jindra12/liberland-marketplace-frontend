export const getSelectedKeys = (pathname: string, items: Array<{ key: string }>) => {
    const found = items.find(({ key }) => pathname.startsWith(key))?.key;
    return found ? [found] : [];
};
