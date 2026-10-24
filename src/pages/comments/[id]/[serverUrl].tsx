import { fetchCommentDetail } from "../../../server/queries";
import { buildCommentPageMetadata } from "../../../detailMetadata/comments";
import { DetailPage } from "../../../detailPage";
import { createDetailPageProps } from "../../../server/detailPage";

const getServerSideProps = createDetailPageProps({
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
