import { fetchIdentityById } from "../../../components/hooks";
import { buildIdentityPageMetadata } from "../../_detailMetadata";
import { createDetailPage } from "../../_detailPage";

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
    buildMetadata: buildIdentityPageMetadata,
    buildCanonicalPath: (params, encodedServerUrl) => `/tribes/${params.id ?? ""}/${encodedServerUrl}`,
});

export { getServerSideProps };

export default DetailPage;
