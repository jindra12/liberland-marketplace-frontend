import { fetchStartupById } from "../../../server/queries";
import { buildStartupPageMetadata } from "../../../detailMetadata/ventures";
import { DetailPage } from "../../../detailPage";
import { createDetailPageProps } from "../../../server/detailPage";

const getServerSideProps = createDetailPageProps({
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
