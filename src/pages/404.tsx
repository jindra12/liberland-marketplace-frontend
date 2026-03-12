import * as React from "react";
import Link from "next/link";
import { AppHead } from "../AppHead";

const NotFoundPage: React.FunctionComponent = () => {
    return (
        <>
            <AppHead
                title="Page not found | NSwap"
                description="The requested page could not be found."
                canonicalPath="/404"
                noIndex
            />
            <main style={{ padding: "40px 20px", fontFamily: "Inter, sans-serif" }}>
                <h1>404: Page not found</h1>
                <p>The page you requested does not exist.</p>
                <p>
                    <Link href="/">Go back to the homepage</Link>
                </p>
            </main>
        </>
    );
};

export default NotFoundPage;
