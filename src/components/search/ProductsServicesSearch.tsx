import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSuggest } from "../AutoSuggest";
import { DocType, SearchOption } from "../../types";
import { useSearchProductsQuery } from "../../generated/graphql";
import { getImage } from "../../utils";

export interface ProductsServicesSearchProps {
    onClose: () => void;
}

export const ProductsServicesSearch: React.FunctionComponent<ProductsServicesSearchProps> = (props) => {
    const navigate = useNavigate();
    const [options, setOptions] = React.useState<SearchOption[]>([]);
    const [term, setTerm] = React.useState("");
    const products = useSearchProductsQuery({
        searchTerm: term,
        limit: 5,
        page: 0,
    }, {
        enabled: term.length > 0,
    });

    React.useEffect(() => {
        if (!products.isFetched) {
            setOptions([]);
        } else if (products.data) {
            setOptions(products
                .data
                .Searches
                ?.docs
                .reduce<SearchOption[]>((acc, { title, doc }) => {
                    const value = (doc.value as DocType)?.id;
                    if (!value) {
                        return acc;
                    }
                    acc.push({ value, label: title, image: getImage(doc.value as DocType) });
                    return acc;
                }, []) ?? [])
        }
    }, [products.isFetched, products.data]);

    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, { value }) => { navigate(`/products/${value}`); props.onClose(); }}
            options={options}
            runSearch={setTerm}
            setOptions={setOptions}
            isLoading={products.isLoading}
        />
    );
};
