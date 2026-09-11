import { createCollectionPage } from "../../collectionPage";

const { getServerSideProps, CollectionPage } = createCollectionPage("/ventures");

export { getServerSideProps };
export default CollectionPage;
