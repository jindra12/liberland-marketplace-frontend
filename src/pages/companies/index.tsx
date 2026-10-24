import { CollectionPage } from "../../collectionPage";
import { createCollectionPageProps } from "../../server/collectionPage";

const getServerSideProps = createCollectionPageProps("/companies");

export { getServerSideProps };
export default CollectionPage;
