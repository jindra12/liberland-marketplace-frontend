import { fetchIdentityById } from "../../../components/hooks";
import { buildIdentityPageMetadata, fetchIdentityRelatedMetadata } from "../../../detailMetadata/identity";
import { createDetailPage } from "../../../detailPage";

const { getServerSideProps, DetailPage } = createDetailPage({
    fetcher: fetchIdentityById,
    buildVariables: (params) => {
        if (!params.id) {
            return null;
        }

        return {
            id: params.id,
        };
    },
    selectEntity: (data) => data.Identity,
    fetchAdditionalData: fetchIdentityRelatedMetadata,
    buildMetadata: buildIdentityPageMetadata,
    buildCanonicalPath: (params, encodedServerUrl) => `/tribes/${params.id ?? ""}/${encodedServerUrl}`,
});

export { getServerSideProps };

export default DetailPage;
