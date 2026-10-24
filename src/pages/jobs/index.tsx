import { CollectionPage } from "../../collectionPage";
import { createCollectionPageProps } from "../../server/collectionPage";

const getServerSideProps = createCollectionPageProps("/jobs");

export { getServerSideProps };
export default CollectionPage;
