// eslint-disable-next-line no-restricted-syntax -- Use React's runtime default import for namespace types.
import React from "react";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

export interface AppRouterProps {
    children: React.ReactNode;
}

export const AppRouter: React.FunctionComponent<AppRouterProps> = (props) => {
    const [router] = React.useState(() => createBrowserRouter([{ path: "*", element: props.children }]));
    return <RouterProvider router={router} />;
};
