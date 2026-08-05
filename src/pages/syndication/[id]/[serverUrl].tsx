import { fetchListPublishedSyndicationUrls } from "../../../components/hooks";
import { buildSyndicationPageMetadata } from "../../_detailMetadata";
import { createDetailPage } from "../../_detailPage";

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
