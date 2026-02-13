import axios from "axios";
import { gqlFetcher } from "../gqlFetcher";
import {
    CompanyByIdDocument,
    IdentityByIdDocument,
    JobByIdDocument,
    ListCompaniesByIdentityDocument,
    ListCompaniesDocument,
    ListIdentitiesDocument,
    ListJobsByCompanyDocument,
    ListJobsDocument,
    ListProductsByCompanyDocument,
    ListProductsDocument,
    ProductByIdDocument,
    SearchCompaniesByIdentityDocument,
    SearchCompaniesDocument,
    SearchIdentitiesDocument,
    SearchJobsByCompanyDocument,
    SearchJobsDocument,
    SearchProductsByCompanyDocument,
    SearchProductsDocument,
} from "../generated/graphql";

jest.mock("axios");

type QueryCase = {
    name: string;
    document: string;
    variables?: Record<string, unknown>;
};

const cases: QueryCase[] = [
    { name: "CompanyById", document: CompanyByIdDocument, variables: { id: "company-id" } },
    { name: "ListCompaniesByIdentity", document: ListCompaniesByIdentityDocument, variables: { identityId: "identity-id" } },
    { name: "SearchCompaniesByIdentity", document: SearchCompaniesByIdentityDocument, variables: { identityId: "identity-id", searchTerm: "term" } },
    { name: "ListCompanies", document: ListCompaniesDocument },
    { name: "SearchCompanies", document: SearchCompaniesDocument, variables: { searchTerm: "term" } },
    { name: "IdentityById", document: IdentityByIdDocument, variables: { id: "identity-id" } },
    { name: "ListIdentities", document: ListIdentitiesDocument },
    { name: "SearchIdentities", document: SearchIdentitiesDocument, variables: { searchTerm: "term" } },
    { name: "ListJobsByCompany", document: ListJobsByCompanyDocument, variables: { companyId: "company-id" } },
    { name: "SearchJobsByCompany", document: SearchJobsByCompanyDocument, variables: { companyId: "company-id", searchTerm: "term" } },
    { name: "JobById", document: JobByIdDocument, variables: { id: "job-id" } },
    { name: "ListJobs", document: ListJobsDocument },
    { name: "SearchJobs", document: SearchJobsDocument, variables: { searchTerm: "term" } },
    { name: "ListProductsByCompany", document: ListProductsByCompanyDocument, variables: { companyId: "company-id" } },
    { name: "SearchProductsByCompany", document: SearchProductsByCompanyDocument, variables: { companyId: "company-id", searchTerm: "term" } },
    { name: "ProductById", document: ProductByIdDocument, variables: { id: "product-id" } },
    { name: "ListProducts", document: ListProductsDocument },
    { name: "SearchProducts", document: SearchProductsDocument, variables: { searchTerm: "term" } },
];

describe("query status checks", () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    const expectedStatus = 200;

    beforeEach(() => {
        mockedAxios.post.mockReset();
    });

    it.each(cases)("$name returns expected HTTP status", async ({ document, variables }) => {
        mockedAxios.post.mockResolvedValueOnce({
            status: expectedStatus,
            statusText: "OK",
            headers: {},
            config: {},
            data: { data: {} },
        } as never);

        await expect(gqlFetcher(document, variables)()).resolves.toEqual({});

        const firstCall = mockedAxios.post.mock.results[0];
        expect(firstCall).toBeDefined();
        await expect(firstCall.value).resolves.toMatchObject({ status: expectedStatus });
    });
});
