import { buildPostPageMetadata } from "../../../detailMetadata/posts";
import { fetchPostById } from "../../../server/queries";
import { DetailPage } from "../../../detailPage";
import { createDetailPageProps } from "../../../server/detailPage";

const getServerSideProps = createDetailPageProps({
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
