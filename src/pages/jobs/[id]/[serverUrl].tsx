import { fetchJobById } from "../../../server/queries";
import { buildJobPageMetadata } from "../../../detailMetadata/jobs";
import { DetailPage } from "../../../detailPage";
import { createDetailPageProps } from "../../../server/detailPage";

const getServerSideProps = createDetailPageProps({
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
