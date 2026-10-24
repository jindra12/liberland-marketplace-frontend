import { fetchCompanyById } from "../../../server/queries";
import { buildCompanyPageMetadata, fetchCompanyRelatedMetadata } from "../../../detailMetadata/companies";
import { DetailPage } from "../../../detailPage";
import { createDetailPageProps } from "../../../server/detailPage";

const getServerSideProps = createDetailPageProps({
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
    fetchAdditionalData: fetchCompanyRelatedMetadata,
});

export { getServerSideProps };

export default DetailPage;
