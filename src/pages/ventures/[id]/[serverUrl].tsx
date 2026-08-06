import { fetchStartupById } from "../../../components/hooks";
import { buildStartupPageMetadata } from "../../../detailMetadata/ventures";
import { createDetailPage } from "../../../detailPage";

const { getServerSideProps, DetailPage } = createDetailPage({
    fetcher: fetchStartupById,
    buildVariables: (params) => {
        if (!params.id) {
            return null;
        }

        return {
            id: params.id,
        };
    },
    selectEntity: (data) => data.Startup,
    buildMetadata: buildStartupPageMetadata,
    buildCanonicalPath: (params, encodedServerUrl) => `/ventures/${params.id ?? ""}/${encodedServerUrl}`,
});

export { getServerSideProps };

export default DetailPage;
