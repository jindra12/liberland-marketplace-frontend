import { createCollectionPage } from "../../collectionPage";

const { getServerSideProps, CollectionPage } = createCollectionPage("/tribes");

export { getServerSideProps };
export default CollectionPage;
