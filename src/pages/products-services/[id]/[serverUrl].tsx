import { fetchProductById } from "../../../server/queries";
import { buildProductPageMetadata, fetchProductRelatedMetadata } from "../../../detailMetadata/products";
import { DetailPage } from "../../../detailPage";
import { createDetailPageProps } from "../../../server/detailPage";

const getServerSideProps = createDetailPageProps({
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
