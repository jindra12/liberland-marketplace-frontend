import { createPublicShellPageProps } from "../server/jsonLd/utils";

export const getServerSideProps = createPublicShellPageProps("/");

export { CollectionPage as default } from "../collectionPage";
