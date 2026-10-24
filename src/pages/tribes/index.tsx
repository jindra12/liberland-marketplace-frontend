import { CollectionPage } from "../../collectionPage";
import { createCollectionPageProps } from "../../server/collectionPage";

const getServerSideProps = createCollectionPageProps("/tribes");

export { getServerSideProps };
export default CollectionPage;
