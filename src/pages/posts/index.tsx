import { CollectionPage } from "../../collectionPage";
import { createCollectionPageProps } from "../../server/collectionPage";

const getServerSideProps = createCollectionPageProps("/posts");

export { getServerSideProps };
export default CollectionPage;
