import { fetchIdentityById } from "../../../server/queries";
import { buildIdentityPageMetadata, fetchIdentityRelatedMetadata } from "../../../detailMetadata/identity";
import { DetailPage } from "../../../detailPage";
import { createDetailPageProps } from "../../../server/detailPage";

const getServerSideProps = createDetailPageProps({
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
