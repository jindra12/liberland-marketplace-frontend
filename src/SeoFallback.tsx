import * as React from "react";

import type { SeoCollectionItem } from "./shellPage/seo";

type SeoFallbackProps = {
    title: string;
    description: string;
    items?: SeoCollectionItem[];
    page?: number;
    hasNextPage?: boolean;
};

export const SeoFallback: React.FunctionComponent<SeoFallbackProps> = (props) => {
    const [hidden, setHidden] = React.useState(false);

    React.useEffect(() => {
        setHidden(true);
    }, []);

    return (
        <section
            className="screen-reader-only"
            hidden={hidden}
            aria-label="Server-rendered marketplace content"
        >
            <h1>{props.title}</h1>
            <p>{props.description}</p>
            {props.items && props.items.length > 0 ? (
                <ul>
                    {props.items.map((item) => (
                        <li key={item.url}>
                            <a href={item.url}>{item.name}</a>
                            {item.description ? <p>{item.description}</p> : null}
                        </li>
                    ))}
                </ul>
            ) : null}
            {props.page && (props.page > 1 || props.hasNextPage) ? (
                <nav aria-label="Listing pagination">
                    {props.page > 1 ? <a href={`?page=${props.page - 1}`}>Previous page</a> : null}
                    {props.hasNextPage ? <a href={`?page=${props.page + 1}`}>Next page</a> : null}
                </nav>
            ) : null}
        </section>
    );
};
