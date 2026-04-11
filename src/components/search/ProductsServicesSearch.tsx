import * as React from "react";

import { useNavigate } from "react-router-dom";

import { DocType, SearchOption } from "../../types";
import { AutoSuggest } from "../AutoSuggest";
import { useSearchProductsQuery } from "../hooks";
import { getImage } from "../shared/image/utils";

export interface ProductsServicesSearchProps {
    onClose: () => void;
}

export const ProductsServicesSearch: React.FunctionComponent<ProductsServicesSearchProps> = (props) => {
    const navigate = useNavigate();
    const [term, setTerm] = React.useState("");
    const products = useSearchProductsQuery(
        {
            searchTerm: term,
            limit: 5,
            page: 1,
        },
        {
            enabled: term.length > 0,
        },
    );
    const options: SearchOption[] =
        !term || !products.isFetched || !products.data
            ? []
            : (products.data.Searches?.docs ?? [])
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
                  });

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
            setOptions={() => {
                setTerm("");
            }}
            isLoading={products.isLoading}
        />
    );
};
