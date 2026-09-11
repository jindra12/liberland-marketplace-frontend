import { createCollectionPage } from "../../collectionPage";

const { getServerSideProps, CollectionPage } = createCollectionPage("/posts");

export { getServerSideProps };
export default CollectionPage;
