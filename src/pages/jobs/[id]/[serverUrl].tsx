import { fetchJobById } from "../../../components/hooks";
import { buildJobPageMetadata } from "../../_detailMetadata";
import { createDetailPage } from "../../_detailPage";

const { getServerSideProps, DetailPage } = createDetailPage({
    fetcher: fetchJobById,
    buildVariables: (params) => {
        if (!params.id) {
            return null;
        }

        return {
            id: params.id,
        };
    },
    selectEntity: (data) => data.Job,
    buildMetadata: buildJobPageMetadata,
    buildCanonicalPath: (params, encodedServerUrl) => `/jobs/${params.id ?? ""}/${encodedServerUrl}`,
});

export { getServerSideProps };

export default DetailPage;
