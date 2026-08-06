import { fetchProductById } from "../../../components/hooks";
import { buildProductPageMetadata, fetchProductRelatedMetadata } from "../../../detailMetadata/products";
import { createDetailPage } from "../../../detailPage";

const { getServerSideProps, DetailPage } = createDetailPage({
    fetcher: fetchProductById,
    buildVariables: (params) => {
        if (!params.id) {
            return null;
        }

        return {
            id: params.id,
        };
    },
    selectEntity: (data) => data.Product,
    fetchAdditionalData: fetchProductRelatedMetadata,
    buildMetadata: buildProductPageMetadata,
    buildCanonicalPath: (params, encodedServerUrl) =>
        `/products-services/${params.id ?? ""}/${encodedServerUrl}`,
});

export { getServerSideProps };

export default DetailPage;
