import { CollectionPage } from "../../collectionPage";
import { createCollectionPageProps } from "../../server/collectionPage";

const getServerSideProps = createCollectionPageProps("/products-services");

export { getServerSideProps };
export default CollectionPage;
