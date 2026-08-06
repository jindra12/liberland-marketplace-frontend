import { fetchListPublishedSyndicationUrls } from "../../../components/hooks";
import { buildSyndicationPageMetadata } from "../../../detailMetadata/syndication";
import { createDetailPage } from "../../../detailPage";

const { getServerSideProps, DetailPage } = createDetailPage({
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
