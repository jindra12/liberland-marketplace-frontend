import { fetchCommentDetail } from "../../../components/hooks";
import { buildCommentPageMetadata } from "../../../detailMetadata";
import { createDetailPage } from "../../../detailPage";

const { getServerSideProps, DetailPage } = createDetailPage({
    fetcher: fetchCommentDetail,
    buildVariables: (params) => {
        if (!params.id) {
            return null;
        }

        return {
            id: params.id,
        };
    },
    selectEntity: (data) => data.Comment,
    buildMetadata: buildCommentPageMetadata,
    buildCanonicalPath: (params, encodedServerUrl) => `/comments/${params.id ?? ""}/${encodedServerUrl}`,
});

export { getServerSideProps };

export default DetailPage;
