import * as React from "react";
import { Head, Html, Main, NextScript } from "next/document";

const DocumentPage: React.FunctionComponent = () => (
    <Html lang="en">
        <Head>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&display=swap" rel="stylesheet" />
        </Head>
        <body>
            <Main />
            <NextScript />
        </body>
    </Html>
);

export default DocumentPage;
