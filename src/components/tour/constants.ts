import { routes } from "../../routes";

import { buildTourDescriptor } from "./utils";
import type { TourConfigMap, TourDefinition, TourType } from "./types";

const home: TourDefinition = {
    type: "home",
    route: routes.home.route,
    requiresAuth: false,
    targetRoute: routes.home.route,
    desktop: [
        buildTourDescriptor(
            "Start on the homepage",
            "This page gives you a quick view of the marketplace and the main sections you can open next.",
            ".SplashPage__heroActions",
            "bottom",
        ),
        buildTourDescriptor(
            "Browse the market sections",
            "These cards take you into jobs, products, companies, ventures, and tribes.",
            ".MarketAccordion",
            "top",
        ),
        buildTourDescriptor(
            "Check the syndicated sources",
            "If extra endpoints are available, this area shows where the marketplace content is coming from.",
            ".SplashPage__syndicationSection",
            "top",
        ),
    ],
    mobile: [
        buildTourDescriptor(
            "Start on the homepage",
            "This page gives you a quick view of the marketplace and the main sections you can open next.",
            ".SplashPage__heroActions",
            "bottom",
        ),
        buildTourDescriptor(
            "Browse the market sections",
            "Scroll down to open jobs, products, companies, ventures, posts, and tribes.",
            ".SplashPage__marketAccordion--mobile",
            "top",
        ),
    ],
};

const jobs: TourDefinition = {
    type: "jobs",
    route: routes.jobs.route,
    requiresAuth: false,
    targetRoute: routes.jobs.route,
    desktop: [
        buildTourDescriptor("Jobs list", "Use this page to scan open roles and open the ones that look useful.", ".AppList__title"),
        buildTourDescriptor(
            "Quick reactions",
            "You can like, share, or open the detail page from the list without leaving the page first.",
            ".LikeButton",
            "right",
        ),
    ],
    mobile: [
        buildTourDescriptor("Jobs list", "Use this page to scan open roles and open the ones that look useful.", ".AppList__title"),
        buildTourDescriptor(
            "Quick reactions",
            "On mobile, the share and details buttons are grouped under the list item actions.",
            ".ListShareDetailButtons",
            "top",
        ),
    ],
};

const jobDetail: TourDefinition = {
    type: "job-detail",
    route: routes.jobs.detail.route,
    requiresAuth: false,
    desktop: [
        buildTourDescriptor("Job details", "This page shows the full role description and who posted it.", ".JobDetail__title"),
        buildTourDescriptor(
            "Share or subscribe",
            "Use the share strip to copy the link or share the role elsewhere.",
            ".ShareSection",
            "left",
        ),
        buildTourDescriptor(
            "Comments",
            "Open the discussion tab to ask questions or react to the job.",
            ".EntityCommentsSection",
            "top",
        ),
    ],
    mobile: [
        buildTourDescriptor("Job details", "This page shows the full role description and who posted it.", ".JobDetail__title"),
        buildTourDescriptor("Share or subscribe", "The share tools are grouped below the main content on mobile.", ".ShareSection", "top"),
    ],
};

const companies: TourDefinition = {
    type: "companies",
    route: routes.companies.route,
    requiresAuth: false,
    targetRoute: routes.companies.route,
    desktop: [
        buildTourDescriptor("Companies list", "Use the list to compare company profiles before opening one.", ".AppList__title"),
        buildTourDescriptor("Like and share", "You can react quickly from each company card.", ".LikeButton", "right"),
    ],
    mobile: [
        buildTourDescriptor("Companies list", "Use the list to compare company profiles before opening one.", ".AppList__title"),
        buildTourDescriptor("Like and share", "The mobile card actions keep share and detail together.", ".ListShareDetailButtons", "top"),
    ],
};

const companyDetail: TourDefinition = {
    type: "company-detail",
    route: routes.companies.detail.route,
    requiresAuth: false,
    desktop: [
        buildTourDescriptor("Company profile", "This page shows the company story and its public details.", ".CompanyDetail__header"),
        buildTourDescriptor("Share or subscribe", "Use the share strip to copy or send this company page.", ".ShareSection", "left"),
        buildTourDescriptor("Related content", "Switch tabs to jobs, products, ventures, posts, or discussion.", ".EntityDetail__tabs", "top"),
    ],
    mobile: [
        buildTourDescriptor("Company profile", "This page shows the company story and its public details.", ".CompanyDetail__header"),
        buildTourDescriptor("Related content", "Tabs and comments sit below the main story on mobile.", ".EntityDetail__tabs", "top"),
    ],
};

const tribes: TourDefinition = {
    type: "tribes",
    route: routes.tribes.route,
    requiresAuth: false,
    targetRoute: routes.tribes.route,
    desktop: [
        buildTourDescriptor("Tribes list", "Use this page to find identities and the groups behind marketplace content.", ".AppList__title"),
        buildTourDescriptor("Like and share", "Each tribe card can be liked or shared from the list.", ".LikeButton", "right"),
    ],
    mobile: [
        buildTourDescriptor("Tribes list", "Use this page to find identities and the groups behind marketplace content.", ".AppList__title"),
        buildTourDescriptor("Share or open", "Mobile card actions keep share and details together.", ".ListShareDetailButtons", "top"),
    ],
};

const tribeDetail: TourDefinition = {
    type: "tribe-detail",
    route: routes.tribes.detail.route,
    requiresAuth: false,
    desktop: [
        buildTourDescriptor("Tribe profile", "This page shows the identity and the listings tied to it.", ".IdentityDetail .EntityDetail__title"),
        buildTourDescriptor("Share this tribe", "Use the share tools if you want to send the identity page to someone else.", ".ShareSection", "left"),
        buildTourDescriptor("Browse connected content", "Switch between products, jobs, companies, and ventures here.", ".EntityDetail__tabs", "top"),
    ],
    mobile: [
        buildTourDescriptor("Tribe profile", "This page shows the identity and the listings tied to it.", ".IdentityDetail .EntityDetail__title"),
        buildTourDescriptor("Browse connected content", "Tabs and discussion live below the main intro on mobile.", ".EntityDetail__tabs", "top"),
    ],
};

const products: TourDefinition = {
    type: "products",
    route: routes.productsServices.route,
    requiresAuth: false,
    targetRoute: routes.productsServices.route,
    desktop: [
        buildTourDescriptor("Products and services", "Use this list to find things you can buy or inspect more closely.", ".AppList__title"),
        buildTourDescriptor("React quickly", "You can like or share an item from the list before opening it.", ".LikeButton", "right"),
    ],
    mobile: [
        buildTourDescriptor("Products and services", "Use this list to find things you can buy or inspect more closely.", ".AppList__title"),
        buildTourDescriptor("React quickly", "On mobile, share and details sit together below the item.", ".ListShareDetailButtons", "top"),
    ],
};

const productDetail: TourDefinition = {
    type: "product-detail",
    route: routes.productsServices.detail.route,
    requiresAuth: false,
    desktop: [
        buildTourDescriptor("Product detail", "This page shows the product summary, seller context, and purchase actions.", ".ProductDetail__purchaseSection"),
        buildTourDescriptor("Like or share", "Use the like button or share strip to react quickly.", ".LikeButton", "right"),
        buildTourDescriptor("Comments", "Open the discussion area to ask questions or leave feedback.", ".EntityCommentsSection", "top"),
    ],
    mobile: [
        buildTourDescriptor("Product detail", "This page shows the product summary, seller context, and purchase actions.", ".ProductDetail__purchaseSection"),
        buildTourDescriptor("Comments", "The comments area sits below the product story on mobile.", ".EntityCommentsSection", "top"),
    ],
};

const posts: TourDefinition = {
    type: "posts",
    route: routes.posts.route,
    requiresAuth: false,
    targetRoute: routes.posts.route,
    desktop: [
        buildTourDescriptor("Posts list", "Use the feed to read updates and announcements from companies and people.", ".AppList__title"),
        buildTourDescriptor("Like or share", "React quickly from the feed before opening a post.", ".LikeButton", "right"),
    ],
    mobile: [
        buildTourDescriptor("Posts list", "Use the feed to read updates and announcements from companies and people.", ".AppList__title"),
        buildTourDescriptor("Share or open", "Mobile list actions keep sharing and opening together.", ".ListShareDetailButtons", "top"),
    ],
};

const postDetail: TourDefinition = {
    type: "post-detail",
    route: routes.posts.detail.route,
    requiresAuth: false,
    desktop: [
        buildTourDescriptor("Post detail", "Read the full post, open related content, and see the discussion.", ".EntityDetail__title"),
        buildTourDescriptor("Like the post", "The like button sits near the top of the post actions.", '.LikeButton[aria-label="Like post"]', "right"),
        buildTourDescriptor("Share and discuss", "Share this post or move to comments from the same page.", ".ShareSection", "left"),
    ],
    mobile: [
        buildTourDescriptor("Post detail", "Read the full post, open related content, and see the discussion.", ".EntityDetail__title"),
        buildTourDescriptor("Share and discuss", "The share strip and comments appear below the post content on mobile.", ".ShareSection", "top"),
    ],
};

const ventures: TourDefinition = {
    type: "ventures",
    route: routes.ventures.route,
    requiresAuth: false,
    targetRoute: routes.ventures.route,
    desktop: [
        buildTourDescriptor("Ventures list", "Use this page to browse startup ideas and active ventures.", ".AppList__title"),
        buildTourDescriptor("Like, share, and details", "You can react quickly from each venture card.", ".LikeButton", "right"),
    ],
    mobile: [
        buildTourDescriptor("Ventures list", "Use this page to browse startup ideas and active ventures.", ".AppList__title"),
        buildTourDescriptor("Like, share, and details", "Mobile action groups keep the important actions together.", ".ListShareDetailButtons", "top"),
    ],
};

const ventureDetail: TourDefinition = {
    type: "venture-detail",
    route: routes.ventures.detail.route,
    requiresAuth: false,
    desktop: [
        buildTourDescriptor("Venture detail", "This page shows the venture pitch, resources, and discussion.", ".StartupDetail"),
        buildTourDescriptor(
            "Join or leave",
            "If you are logged in, the venture action button lets you join or leave the team.",
            ".StartupDetail__joinAction",
            "right",
        ),
        buildTourDescriptor("Share and discuss", "Use the share section and discussion tab to spread the idea.", ".ShareSection", "left"),
    ],
    mobile: [
        buildTourDescriptor("Venture detail", "This page shows the venture pitch, resources, and discussion.", ".StartupDetail"),
        buildTourDescriptor("Share and discuss", "The discussion lives in tabs below the main story on mobile.", ".EntityDetail__tabs", "top"),
    ],
};

const profile: TourDefinition = {
    type: "profile",
    route: routes.profile.route,
    requiresAuth: true,
    targetRoute: routes.profile.route,
    desktop: [
        buildTourDescriptor("Profile summary", "This is the public account area where your name and email live.", ".Profile__info"),
        buildTourDescriptor("Nickname and password", "Use these cards to update the name and password on the selected server.", ".Profile__nicknameCard", "right"),
        buildTourDescriptor("Payment and address info", "Use the contact card to manage wallets and shipping details.", ".Profile__contactCard", "left"),
    ],
    mobile: [
        buildTourDescriptor("Profile summary", "This is the public account area where your name and email live.", ".Profile__info"),
        buildTourDescriptor("Payment and address info", "Wallets, addresses, and the save button live inside the contact card.", ".Profile__contactCard", "top"),
    ],
    introDesktop: [
        buildTourDescriptor(
            "Log in or sign up",
            "Start here with the login button in the top right if you are not signed in yet.",
            ".AppHeader__authBtn",
            "bottom",
        ),
    ],
    introMobile: [
        buildTourDescriptor(
            "Log in or sign up",
            "Start here with the login button in the top bar if you are not signed in yet.",
            ".AppHeader__mobileAuthBtn",
            "bottom",
        ),
    ],
};

const profileWallets: TourDefinition = {
    type: "profile-wallets",
    route: routes.profile.route,
    requiresAuth: true,
    targetRoute: routes.profile.route,
    desktop: [
        buildTourDescriptor("Wallet list", "Add payment wallets here. The order matters because the top one is preferred first.", ".Profile__walletField"),
        buildTourDescriptor("Add a wallet", "Use this button to add another wallet entry.", ".Profile__walletAddButton", "right"),
    ],
    mobile: [
        buildTourDescriptor("Wallet list", "Add payment wallets here. The order matters because the top one is preferred first.", ".Profile__walletField"),
        buildTourDescriptor("Add a wallet", "Use this button to add another wallet entry.", ".Profile__walletAddButton", "top"),
    ],
};

const profileAddress: TourDefinition = {
    type: "profile-address",
    route: routes.profile.route,
    requiresAuth: true,
    targetRoute: routes.profile.route,
    desktop: [
        buildTourDescriptor("Shipping address", "Use this section to save your preferred shipping address.", ".Profile__addressField"),
        buildTourDescriptor("Reset saved address", "You can clear the saved shipping address if it needs to change.", ".Profile__contactCard .ant-btn-dangerous", "left"),
    ],
    mobile: [
        buildTourDescriptor("Shipping address", "Use this section to save your preferred shipping address.", ".Profile__addressField"),
        buildTourDescriptor("Reset saved address", "The reset button sits below the address controls.", ".Profile__contactCard .ant-btn-dangerous", "top"),
    ],
};

const publish: TourDefinition = {
    type: "publish",
    route: routes.publish.route,
    requiresAuth: true,
    targetRoute: routes.publish.route,
    desktop: [
        buildTourDescriptor("Choose what to publish", "Pick a listing type first: job, company, product, post, or venture.", ".Publish"),
        buildTourDescriptor("Start from the right card", "Each card opens the matching form for that listing type.", ".Publish__category", "right"),
    ],
    mobile: [
        buildTourDescriptor("Choose what to publish", "Pick a listing type first: job, company, product, post, or venture.", ".Publish"),
        buildTourDescriptor("Start from the right card", "Each card opens the matching form for that listing type.", ".Publish__category", "top"),
    ],
    introDesktop: [
        buildTourDescriptor(
            "Log in or sign up",
            "Use the login button in the header before you try to publish anything.",
            ".AppHeader__authBtn",
            "bottom",
        ),
    ],
    introMobile: [
        buildTourDescriptor(
            "Log in or sign up",
            "Use the login button in the header before you try to publish anything.",
            ".AppHeader__mobileAuthBtn",
            "bottom",
        ),
    ],
};

const publishJob: TourDefinition = {
    type: "publish-job",
    route: routes.publish.route,
    requiresAuth: true,
    targetRoute: routes.publish.route,
    desktop: [
        buildTourDescriptor("Job form", "Fill in the job title, description, company, and the rest of the posting details.", ".Publish__jobTitleField"),
        buildTourDescriptor("Finish publishing", "Use the publish or draft buttons when the job is ready.", ".Publish__submitButtons", "right"),
    ],
    mobile: [
        buildTourDescriptor("Job form", "Fill in the job title, description, company, and the rest of the posting details.", ".Publish__jobTitleField"),
        buildTourDescriptor("Finish publishing", "Use the publish or draft buttons when the job is ready.", ".Publish__submitButtons", "top"),
    ],
};

const publishCompany: TourDefinition = {
    type: "publish-company",
    route: routes.publish.route,
    requiresAuth: true,
    targetRoute: routes.publish.route,
    desktop: [
        buildTourDescriptor("Company form", "Set the company name, tribe, and contact details here.", ".Publish__companyNameField"),
        buildTourDescriptor("Finish publishing", "Use the publish or draft buttons when the company is ready.", ".Publish__submitButtons", "right"),
    ],
    mobile: [
        buildTourDescriptor("Company form", "Set the company name, tribe, and contact details here.", ".Publish__companyNameField"),
        buildTourDescriptor("Finish publishing", "Use the publish or draft buttons when the company is ready.", ".Publish__submitButtons", "top"),
    ],
};

const publishProduct: TourDefinition = {
    type: "publish-product",
    route: routes.publish.route,
    requiresAuth: true,
    targetRoute: routes.publish.route,
    desktop: [
        buildTourDescriptor("Product form", "Set the product name, price, and company on this screen.", ".Publish__productNameField"),
        buildTourDescriptor("Finish publishing", "Use the publish or draft buttons when the product is ready.", ".Publish__submitButtons", "right"),
    ],
    mobile: [
        buildTourDescriptor("Product form", "Set the product name, price, and company on this screen.", ".Publish__productNameField"),
        buildTourDescriptor("Finish publishing", "Use the publish or draft buttons when the product is ready.", ".Publish__submitButtons", "top"),
    ],
};

const publishPost: TourDefinition = {
    type: "publish-post",
    route: routes.publish.route,
    requiresAuth: true,
    targetRoute: routes.publish.route,
    desktop: [
        buildTourDescriptor("Post form", "Write the title, content, and related company or content for the post.", ".Publish__postTitleField"),
        buildTourDescriptor("Finish publishing", "Use the publish or draft buttons when the post is ready.", ".Publish__submitButtons", "right"),
    ],
    mobile: [
        buildTourDescriptor("Post form", "Write the title, content, and related company or content for the post.", ".Publish__postTitleField"),
        buildTourDescriptor("Finish publishing", "Use the publish or draft buttons when the post is ready.", ".Publish__submitButtons", "top"),
    ],
};

const publishStartup: TourDefinition = {
    type: "publish-startup",
    route: routes.publish.route,
    requiresAuth: true,
    targetRoute: routes.publish.route,
    desktop: [
        buildTourDescriptor("Venture form", "Describe the venture, the company, and the tribe it belongs to.", ".Publish__startupTitleField"),
        buildTourDescriptor("Team and resources", "Add the stage and the resources you need before you publish.", ".Publish__startupStageField", "right"),
        buildTourDescriptor("Finish publishing", "Use the publish or draft buttons when the venture is ready.", ".Publish__submitButtons", "right"),
    ],
    mobile: [
        buildTourDescriptor("Venture form", "Describe the venture, the company, and the tribe it belongs to.", ".Publish__startupTitleField"),
        buildTourDescriptor("Finish publishing", "Use the publish or draft buttons when the venture is ready.", ".Publish__submitButtons", "top"),
    ],
};

const cart: TourDefinition = {
    type: "cart",
    route: routes.cart.route,
    requiresAuth: false,
    targetRoute: routes.cart.route,
    desktop: [
        buildTourDescriptor("Cart", "Review the items you selected before going to checkout.", ".CartPage"),
        buildTourDescriptor("Go to order", "Use this button when you are ready to proceed.", ".CartPage__orderButton", "left"),
    ],
    mobile: [
        buildTourDescriptor("Cart", "Review the items you selected before going to checkout.", ".CartPage"),
        buildTourDescriptor("Go to order", "Use this button when you are ready to proceed.", ".CartPage__orderButton", "top"),
    ],
};

const order: TourDefinition = {
    type: "order",
    route: routes.order.route,
    requiresAuth: false,
    targetRoute: routes.order.route,
    desktop: [
        buildTourDescriptor("Order", "Confirm shipping details and payment settings here.", ".OrderPage"),
        buildTourDescriptor("Payment step", "The payment controls live in the checkout flow below.", ".OrderPage", "left"),
    ],
    mobile: [
        buildTourDescriptor("Order", "Confirm shipping details and payment settings here.", ".OrderPage"),
        buildTourDescriptor("Payment step", "The payment controls live in the checkout flow below.", ".OrderPage", "top"),
    ],
};

const syndication: TourDefinition = {
    type: "syndication",
    route: routes.syndication.route,
    requiresAuth: false,
    targetRoute: routes.syndication.route,
    desktop: [
        buildTourDescriptor("Syndication list", "See which backend URLs are available in this marketplace.", ".SyndicationList__addCompact"),
        buildTourDescriptor("Open a source", "Use the details link to inspect a single source.", ".EntityList__actionsRow", "right"),
    ],
    mobile: [
        buildTourDescriptor("Syndication list", "See which backend URLs are available in this marketplace.", ".SyndicationList__addCompact"),
        buildTourDescriptor("Open a source", "Use the details link to inspect a single source.", ".SyndicationList__compactActions", "top"),
    ],
};

const syndicationDetail: TourDefinition = {
    type: "syndication-detail",
    route: routes.syndication.detail.route,
    requiresAuth: false,
    desktop: [
        buildTourDescriptor("Syndication detail", "Check whether the source is enabled and what URL it points to.", ".SyndicationDetail__meta"),
        buildTourDescriptor("Toggle or visit", "Use the action buttons to enable, disable, or open the source.", ".SyndicationDetail__headerCopy", "left"),
    ],
    mobile: [
        buildTourDescriptor("Syndication detail", "Check whether the source is enabled and what URL it points to.", ".SyndicationDetail__meta"),
        buildTourDescriptor("Toggle or visit", "The action buttons live below the main header on mobile.", ".SyndicationDetail__headerCopy", "top"),
    ],
};

const syndicate: TourDefinition = {
    type: "syndicate",
    route: routes.syndicate.route,
    requiresAuth: false,
    targetRoute: routes.syndicate.route,
    desktop: [
        buildTourDescriptor("Set up a marketplace", "This walkthrough explains how to bring a marketplace online.", ".SyndicateModal__content"),
        buildTourDescriptor("Follow the steps", "Use Next and the page picker to move through the setup pages.", ".SyndicateModal__pagerControls", "top"),
    ],
    mobile: [
        buildTourDescriptor("Set up a marketplace", "This walkthrough explains how to bring a marketplace online.", ".SyndicateModal__content"),
        buildTourDescriptor("Follow the steps", "Use Next and the page picker to move through the setup pages.", ".SyndicateModal__pagerControls", "top"),
    ],
};

export const TOUR_DEFINITIONS: TourConfigMap = {
    home,
    jobs,
    "job-detail": jobDetail,
    companies,
    "company-detail": companyDetail,
    tribes,
    "tribe-detail": tribeDetail,
    products,
    "product-detail": productDetail,
    posts,
    "post-detail": postDetail,
    ventures,
    "venture-detail": ventureDetail,
    profile,
    "profile-wallets": profileWallets,
    "profile-address": profileAddress,
    publish,
    "publish-job": publishJob,
    "publish-company": publishCompany,
    "publish-product": publishProduct,
    "publish-post": publishPost,
    "publish-startup": publishStartup,
    cart,
    order,
    syndication,
    "syndication-detail": syndicationDetail,
    syndicate,
};

export const TOUR_ROUTE_TO_TYPES: Record<string, TourType[]> = {
    [routes.home.route]: ["home"],
    [routes.jobs.route]: ["jobs"],
    [routes.companies.route]: ["companies"],
    [routes.tribes.route]: ["tribes"],
    [routes.productsServices.route]: ["products"],
    [routes.posts.route]: ["posts"],
    [routes.ventures.route]: ["ventures"],
    [routes.profile.route]: ["profile", "profile-wallets", "profile-address"],
    [routes.publish.route]: ["publish", "publish-job", "publish-company", "publish-product", "publish-post", "publish-startup"],
    [routes.cart.route]: ["cart"],
    [routes.order.route]: ["order"],
    [routes.syndication.route]: ["syndication"],
    [routes.syndicate.route]: ["syndicate"],
};

export const TOUR_AUTH_PROMPT_STEPS = {
    desktop: [
        buildTourDescriptor(
            "Log in or sign up",
            "Use the button in the top right if you want to continue with a route that needs an account.",
            ".AppHeader__authBtn",
            "bottom",
        ),
    ],
    mobile: [
        buildTourDescriptor(
            "Log in or sign up",
            "Use the button in the top bar if you want to continue with a route that needs an account.",
            ".AppHeader__mobileAuthBtn",
            "bottom",
        ),
    ],
};
