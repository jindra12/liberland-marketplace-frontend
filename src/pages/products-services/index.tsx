import { createCollectionPage } from "../../collectionPage";

const { getServerSideProps, CollectionPage } = createCollectionPage("/products-services");

export { getServerSideProps };
export default CollectionPage;
