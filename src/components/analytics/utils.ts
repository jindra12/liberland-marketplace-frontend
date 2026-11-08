export const sanitizeAnalyticsRoute = (route: string): string => route.split(/[?#]/)[0];
