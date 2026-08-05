import { createDetailPage } from "../../_detailPage";
import { buildPostPageMetadata } from "../../_detailMetadata";
import { fetchPostById } from "../../../components/hooks";

const { getServerSideProps, DetailPage } = createDetailPage({
    fetcher: fetchPostById,
    buildVariables: (params) => {
        if (!params.id) {
            return null;
        }

        return {
            id: params.id,
        };
    },
    selectEntity: (data) => data.Post,
    buildMetadata: buildPostPageMetadata,
    buildCanonicalPath: (params, encodedServerUrl) => `/posts/${params.id ?? ""}/${encodedServerUrl}`,
});

export { getServerSideProps };

export default DetailPage;
