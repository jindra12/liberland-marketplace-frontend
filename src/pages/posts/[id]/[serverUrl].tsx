import { buildPostPageMetadata } from "../../../detailMetadata/posts";
import { fetchPostById } from "../../../components/hooks";
import { createDetailPage } from "../../../detailPage";

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
