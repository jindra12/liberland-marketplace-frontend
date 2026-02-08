import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AutoSuggest } from "../AutoSuggest";
import { SearchOption } from "../../types";
import { useSearchProductsQuery } from "../../generated/graphql";

export interface ProductsServicesSearchProps {
    onClose: () => void;
}

export const ProductsServicesSearch: React.FunctionComponent<ProductsServicesSearchProps> = (props) => {
    const navigate = useNavigate();
    const [options, setOptions] = React.useState<SearchOption[]>([]);
    const [term, setTerm] = React.useState<string>();
    const products = useSearchProductsQuery({
        searchTerm: term || "",
        limit: 5,
        page: 0,
    }, {
        enabled: Boolean(term),
    });

    React.useEffect(() => {
        if (!products.isFetched) {
            setOptions([]);
        } else if (products.data) {
            setOptions(products.data.Searches?.docs.map(({ id, title }) => ({ value: id, label: title })) || [])
        }
    }, [products.isFetched, products.data]);

    return (
        <AutoSuggest
            onClose={props.onClose}
            onSelect={(_, { value }) => navigate(`/products-services/${value}`)}
            options={options}
            runSearch={setTerm}
            setOptions={setOptions}
            isLoading={products.isLoading}
        />
    );
};