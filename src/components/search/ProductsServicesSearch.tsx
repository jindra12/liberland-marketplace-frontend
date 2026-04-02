import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSuggest } from "../AutoSuggest";
import { DocType, SearchOption } from "../../types";

import { getImage } from "../shared/image/utils";
import { useSearchProductsQuery } from "../hooks";

export interface ProductsServicesSearchProps {
    onClose: () => void;
}

export const ProductsServicesSearch: React.FunctionComponent<ProductsServicesSearchProps> = (props) => {
    const navigate = useNavigate();
    const [options, setOptions] = React.useState<SearchOption[]>([]);
    const [term, setTerm] = React.useState("");
    const products = useSearchProductsQuery(
        {
            searchTerm: term,
            limit: 5,
            page: 0,
        },
        {
            enabled: term.length > 0,
        },
    );

    React.useEffect(() => {
        if (!products.isFetched) {
            setOptions([]);
        } else if (products.data) {
            setOptions(
                (products.data.Searches?.docs ?? [])
                    .filter((searchDoc) => searchDoc.doc?.relationTo === "products")
                    .map((searchDoc, index) => {
                        const doc = searchDoc.doc!.value as DocType;
                        const value = `${doc.serverURL || ""}|${doc.id!}`;

                        return {
                            key: `${searchDoc.id}-${doc.serverURL || ""}-${value}-${index}`,
                            value,
                            id: doc.id!,
                            label: searchDoc.title,
                            image: getImage(doc),
                        };
                    }),
            );
        }
    }, [products.isFetched, products.data]);

    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, option) => {
                navigate(`/products-services/${option.id}`);
                props.onClose();
            }}
            options={options}
            title="Product / Service search"
            runSearch={setTerm}
            setOptions={setOptions}
            isLoading={products.isLoading}
        />
    );
};
