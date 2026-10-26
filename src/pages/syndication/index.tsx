import { createPublicShellPageProps } from "../../server/jsonLd/utils";

export const getServerSideProps = createPublicShellPageProps("/syndication");

export { CollectionPage as default } from "../../collectionPage";
