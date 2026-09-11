import { createCollectionPage } from "../../collectionPage";

const { getServerSideProps, CollectionPage } = createCollectionPage("/jobs");

export { getServerSideProps };
export default CollectionPage;
