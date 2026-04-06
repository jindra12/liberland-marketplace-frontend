import { Comment_ReplyPostRelationshipInputRelationTo } from "../../src/generated/graphql";
import { COMMENT_RELATION_TO_QUERY_RELATION } from "../../src/constants";

import { DEEP_DIVE_ROUTES, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountMainRoute,
    mountMainHome,
    waitForCollectionQuery,
    waitForDetailQuery,
    waitForRouteLoad,
    homepageQueries,
} from "../support/component-tests/utils";

describe("company deep dive", () => {
    beforeEach(() => {
        mountMainRoute(DEEP_DIVE_ROUTES.company);
        waitForRouteLoad(".LoadingSkeleton--detail");
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "CompanyById",
            { id: "company-harbor-labs" },
            "Company",
            "company-harbor-labs",
            "Harbor Labs",
        );
    });

    it("shows company content, tabs, and comments", () => {
        cy.get(".CompanyDetail").should("be.visible");
        cy.contains(".EntityDetail__title", "Harbor Labs").should("be.visible");
        cy.contains(".Markdown", "Distributed shipping and tooling").should("be.visible");
        cy.get(".CompanyContactLinks").should("be.visible").contains("hello@harbor.example");
        cy.get(".ShareSection").should("be.visible").contains("Share this company");
        cy.get(".ShareSection__nativeButton").should("be.visible");
        cy.get(".ShareSection__iconButton").its("length").should("be.greaterThan", 0);
        cy.get(".CompanyDetail__identityRow").should("be.visible");

        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListJobsByCompany",
            { companyId: "company-harbor-labs", page: 1, limit: 20 },
            "Jobs",
            "Dockmaster",
        );
        cy.contains(".JobList__body", "Coordinate shipping and fulfilment").should("be.visible");
        cy.contains(".JobList__body", "Harbor City").should("be.visible");

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Products / Services").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListProductsByCompany",
            { companyId: "company-harbor-labs", page: 1, limit: 20 },
            "Products",
            "Solar Widget",
        );
        cy.contains(".EntityList__description", "Unlimited utility hardware").should("be.visible");

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Ventures").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListStartupsByCompany",
            { companyId: "company-harbor-labs", page: 1, limit: 20 },
            "Startups",
            "Sky Relay",
        );
        cy.contains(".EntityList__description", "Relay beacons for the marketplace").should("be.visible");

        cy.contains(".EntityDetail__tabs .ant-tabs-tab", "Discussion").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCommentsByTarget",
            {
                limit: 100,
                page: 1,
                relationTo: COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Companies],
                targetId: "company-harbor-labs",
            },
            "Comments",
            "Harbor Labs has strong logistics.",
        );
        cy.contains(".EntityCommentsSection", "Harbor Labs has strong logistics.").should("be.visible");
    });
});

describe("job deep dive", () => {
    beforeEach(() => {
        mountMainRoute(DEEP_DIVE_ROUTES.job);
        waitForRouteLoad(".LoadingSkeleton--detail");
        waitForDetailQuery(MAIN_SERVER_URL, "JobById", { id: "job-dockmaster" }, "Job", "job-dockmaster", "Dockmaster");
    });

    it("shows the salary tag, company metadata, and comments", () => {
        cy.get(".JobDetail").should("be.visible");
        cy.contains(".EntityDetail__title", "Dockmaster").should("be.visible");
        cy.get(".JobDetail__summary").contains("Harbor Labs").should("be.visible");
        cy.get(".JobDetail__summary").contains("Harbor City").should("be.visible");
        cy.get(".JobDetail__summary").contains("2 positions").should("be.visible");
        cy.get(".JobDetail__summary").contains("USD 3,200 – 4,000").should("be.visible");
        cy.get(".ShareSection").should("be.visible").contains("Share this job");
        cy.get(".JobDetail__identityRow").should("be.visible");

        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCommentsByTarget",
            {
                limit: 100,
                page: 1,
                relationTo: COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Jobs],
                targetId: "job-dockmaster",
            },
            "Comments",
            "Dockmaster keeps Harbor Labs moving.",
        );
        cy.contains(".EntityCommentsSection", "Dockmaster keeps Harbor Labs moving.").should("be.visible");
    });
});

describe("venture deep dive", () => {
    beforeEach(() => {
        mountMainRoute(DEEP_DIVE_ROUTES.venture);
        waitForRouteLoad(".LoadingSkeleton--detail");
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "StartupById",
            { id: "startup-sky-relay" },
            "Startup",
            "startup-sky-relay",
            "Sky Relay",
        );
    });

    it("shows the venture details, resources, and discussion", () => {
        cy.get(".StartupDetail").should("be.visible");
        cy.contains(".StartupDetail__eyebrow", "Venture").should("be.visible");
        cy.contains(".StartupDetail__title", "Sky Relay").should("be.visible");
        cy.contains(".StartupDetail__badgeRow", "MVP").should("be.visible");
        cy.contains(".StartupDetail__summary", "Harbor Labs").should("be.visible");
        cy.get(".StartupDetail__section--resources").within(() => {
            cy.contains("Looking for").should("be.visible");
            cy.contains("Founders").should("be.visible");
            cy.contains("Already have").should("be.visible");
            cy.contains("Product").should("be.visible");
            cy.contains("Distribution").should("be.visible");
        });
        cy.get(".ShareSection").should("be.visible").contains("Share this venture");
        cy.get(".StartupDetail__tabs").contains("Team (2)").should("be.visible");

        cy.contains(".StartupDetail__tabs .ant-tabs-tab", "Discussion").click();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCommentsByTarget",
            {
                limit: 100,
                page: 1,
                relationTo: COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Startups],
                targetId: "startup-sky-relay",
            },
            "Comments",
            "Sky Relay could use more testers.",
        );
        cy.contains(".EntityCommentsSection", "Sky Relay could use more testers.").should("be.visible");
    });
});

describe("identity deep dive", () => {
    beforeEach(() => {
        mountMainRoute(DEEP_DIVE_ROUTES.identity);
        waitForRouteLoad(".LoadingSkeleton--detail");
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "IdentityById",
            { id: "identity-nova" },
            "Identity",
            "identity-nova",
            "Nova Rivers",
        );
    });

    it("shows the company list and related market cards", () => {
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCompaniesByIdentity",
            { identityId: "identity-nova", page: 1, limit: 3 },
            "Companies",
            "Harbor Labs",
        );
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListJobsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 3 },
            "Jobs",
            "Dockmaster",
        );
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListProductsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 3 },
            "Products",
            "Solar Widget",
        );
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListStartupsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 3 },
            "Startups",
            "Sky Relay",
        );

        cy.get(".IdentityDetail").should("be.visible");
        cy.contains(".EntityDetail__title", "Nova Rivers").should("be.visible");
        cy.get(".SplashEntityCard--companies").should("be.visible").contains("Harbor Labs");
        cy.get(".SplashEntityCard--jobs").should("be.visible").contains("Dockmaster");
        cy.get(".SplashEntityCard--products").should("be.visible").contains("Solar Widget");
        cy.get(".SplashEntityCard--ventures").should("be.visible").contains("Sky Relay");
        cy.get(".ShareSection").should("be.visible").contains("Share this tribe");
    });
});

describe("share buttons", () => {
    it("shows list share controls on the companies list and home cards", () => {
        mountMainRoute(DEEP_DIVE_ROUTES.home);
        waitForRouteLoad(".LoadingSkeleton--splashSections");
        homepageQueries();

        cy.get(".SplashPage__identitySection .NativeShareButton").its("length").should("be.greaterThan", 0);
        cy.get(".SplashPage__syndicationCardActions .NativeShareButton").its("length").should("be.greaterThan", 0);

        mountMainRoute(DEEP_DIVE_ROUTES.companies);
        waitForRouteLoad(".LoadingSkeleton--collection");
        waitForCollectionQuery(MAIN_SERVER_URL, "ListCompanies", { limit: 20, page: 1 }, "Companies", "Harbor Labs");

        cy.get(".ListShareDetailButtons").should("be.visible");
        cy.get(".NativeShareButton").should("be.visible");
        cy.get(".ActionBtn").contains("Details").should("be.visible");
    });

    it("shows detail share controls on a company page", () => {
        mountMainRoute(DEEP_DIVE_ROUTES.company);
        waitForRouteLoad(".LoadingSkeleton--detail");
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "CompanyById",
            { id: "company-harbor-labs" },
            "Company",
            "company-harbor-labs",
            "Harbor Labs",
        );

        cy.get(".ShareSection").should("be.visible");
        cy.get(".ShareSection__buttons").should("be.visible");
        cy.get(".ShareSection__iconButton").its("length").should("be.greaterThan", 0);
        cy.get(".ShareSection__nativeButton").should("be.visible");
    });
});

describe("share controls", () => {
    it("uses the desktop share layout at 1200px and up", () => {
        cy.viewport(1200, 1200);
        mountMainRoute(DEEP_DIVE_ROUTES.company);
        waitForRouteLoad(".LoadingSkeleton--detail");
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "CompanyById",
            { id: "company-harbor-labs" },
            "Company",
            "company-harbor-labs",
            "Harbor Labs",
        );

        cy.get(".ShareSection").should("be.visible");
        cy.get(".ShareSection--mobile").should("not.exist");
        cy.get(".ShareSection__actions").should("be.visible");
        cy.get(".ShareSection__buttons").should("be.visible");
        cy.get(".ShareSection__iconButton").its("length").should("be.greaterThan", 0);
        cy.get(".ShareSection__nativeButton").should("be.visible");
    });

    it("uses the mobile share layout below 1200px", () => {
        cy.viewport(1199, 1200);
        mountMainRoute(DEEP_DIVE_ROUTES.company);
        waitForRouteLoad(".LoadingSkeleton--detail");
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "CompanyById",
            { id: "company-harbor-labs" },
            "Company",
            "company-harbor-labs",
            "Harbor Labs",
        );

        cy.get(".ShareSection--mobile").should("be.visible");
        cy.get(".ShareSection__mobileActions").should("be.visible");
        cy.get(".ShareSection__mobileButton").its("length").should("be.greaterThan", 0);
        cy.get(".ShareSection__actions").should("not.exist");
        cy.get(".ShareSection__iconButton").should("not.exist");
    });
});

describe("identity cards", () => {
    it("hides identities with no related market cards", () => {
        mountMainHome();
        homepageQueries();

        cy.contains(".SplashPage__identityHeadingLink", "Sage Bloom").should("not.exist");
    });

    it("shows a four-company identity preview with a more link", () => {
        mountMainHome();
        homepageQueries();

        cy.contains(".SplashPage__identityHeadingLink", "Fourfold Harbor")
            .parents(".SplashPage__identitySection")
            .should("have.length", 1)
            .within(() => {
                cy.get(".SplashEntityCard--companies").should("be.visible");
                cy.get(".SplashEntityCard__itemLink").contains("Fourfold One").should("be.visible");
                cy.get(".SplashEntityCard__itemLink").contains("Fourfold Two").should("be.visible");
                cy.get(".SplashEntityCard__itemLink").contains("Fourfold Three").should("be.visible");
                cy.contains(".SplashEntityCard__moreLink", "And +1 more").should("be.visible");
            });
    });
});

describe("inactive job", () => {
    it("shows the inactive title state and notice", () => {
        mountMainRoute(DEEP_DIVE_ROUTES.inactiveJob);
        waitForRouteLoad(".LoadingSkeleton--detail");
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "JobById",
            { id: "job-harbor-watch" },
            "Job",
            "job-harbor-watch",
            "Harbor Watch",
        );

        cy.get(".JobDetail__title del").should("contain", "Harbor Watch");
        cy.get(".JobInactiveNotice").should("be.visible").contains("no longer active");
        cy.get(".JobDetail__summary").contains("USD 2,600 – 3,100").should("be.visible");
    });
});
