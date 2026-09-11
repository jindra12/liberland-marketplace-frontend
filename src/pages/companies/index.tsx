import { createCollectionPage } from "../../collectionPage";

const { getServerSideProps, CollectionPage } = createCollectionPage("/companies");

export { getServerSideProps };
export default CollectionPage;
