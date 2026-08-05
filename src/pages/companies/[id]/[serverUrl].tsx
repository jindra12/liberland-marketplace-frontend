import { fetchCompanyById } from "../../../components/hooks";
import { buildCompanyPageMetadata } from "../../../detailMetadata";
import { createDetailPage } from "../../../detailPage";

const { getServerSideProps, DetailPage } = createDetailPage({
    fetcher: fetchCompanyById,
    buildVariables: (params) => {
        if (!params.id) {
            return null;
        }

        return {
            id: params.id,
        };
    },
    selectEntity: (data) => data.Company,
    buildMetadata: buildCompanyPageMetadata,
    buildCanonicalPath: (params, encodedServerUrl) => `/companies/${params.id ?? ""}/${encodedServerUrl}`,
});

export { getServerSideProps };

export default DetailPage;
