import { fetchListPublishedSyndicationUrls } from "../../../server/queries";
import { buildSyndicationPageMetadata } from "../../../detailMetadata/syndication";
import { DetailPage } from "../../../detailPage";
import { createDetailPageProps } from "../../../server/detailPage";

const getServerSideProps = createDetailPageProps({
    fetcher: fetchListPublishedSyndicationUrls,
    buildVariables: () => {
        return {};
    },
    selectEntity: (data, params) => data.Syndications?.docs.find((entry) => entry.url === (params.id ?? "")),
    buildMetadata: buildSyndicationPageMetadata,
    buildCanonicalPath: (params, encodedServerUrl) =>
        `/syndication/${encodeURIComponent(params.id ?? "")}/${encodedServerUrl}`,
});

export { getServerSideProps };

export default DetailPage;
