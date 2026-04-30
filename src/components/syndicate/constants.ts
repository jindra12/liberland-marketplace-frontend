export type SyndicatePage = {
    eyebrow: string;
    title: string;
    description: string;
    highlights: string[];
    downloadLabel?: string;
    command?: string[];
    links?: {
        label: string;
        href: string;
        download?: string;
    }[];
};

export const SYNDICATE_PAGES: SyndicatePage[] = [
    {
        eyebrow: "Welcome",
        title: "Let’s get your marketplace online",
        description: "If this is your first time, start here. We’ll walk through the setup one step at a time.",
        highlights: [
            "Pick a server.",
            "Download the setup script.",
            "Run it and finish the last step in your browser.",
        ],
        downloadLabel: "Download the setup script",
    },
    {
        eyebrow: "Recommended Server",
        title: "We recommend a Contabo VPS on Ubuntu 24.04 LTS",
        description: "That is the setup we suggest for most people because it is a simple, reliable place to start.",
        highlights: [
            "A Contabo VPS gives you enough room to begin comfortably.",
            "Ubuntu 24.04 LTS is the version we suggest.",
        ],
        links: [
            {
                label: "Visit Contabo",
                href: "https://contabo.com",
            },
        ],
    },
    {
        eyebrow: "How To Get The Script Onto Contabo",
        title: "Download the setup script",
        description: "After you log into the server, copy the script onto it and make it ready to run.",
        command: [
            "curl -fsSL https://backend.nswap.io/deploy-space -o deploy-space.sh",
            "chmod +x deploy-space.sh",
        ],
        highlights: [
            "The script is also available at /deploy-space.",
            "If you already know the app address, you can use it directly.",
        ],
        downloadLabel: "Open the script download",
    },
    {
        eyebrow: "What The Installer Does",
        title: "Let the script do the setup",
        description: "When you run it, the script sets up the app, brings the site online, and gives you an admin page when it is done.",
        highlights: [
            "It handles the app setup for you.",
            "It brings the site online.",
            "It gives you an admin page at the end.",
        ],
    },
    {
        eyebrow: "What You Need To Set",
        title: "Choose a name for your site",
        description: "The only thing you must provide is the site name. Everything else can be added later if you want it.",
        highlights: [
            "Pick a short subdomain.",
            "Add login settings only if you need them.",
            "Add email settings only if you need them.",
        ],
    },
    {
        eyebrow: "Payments And Wallets",
        title: "Wallet payments are supported if you want them",
        description: "The marketplace can work with Ethereum, Solana, or Tron wallets, depending on how you set it up.",
        highlights: [
            "That keeps checkout familiar for crypto users.",
            "Which wallet works depends on the payment setup.",
        ],
    },
    {
        eyebrow: "Running The Installer",
        title: "Start the installer",
        description:
            "When you are ready, run the command below to start the setup. If you are testing a branch, you can point the script at that branch too.",
        command: ["bash deploy-space.sh"],
        highlights: [
            "Use the basic command for a normal install.",
            "Use the branch version if you want to test a change.",
            "The script prints the links you need when it finishes.",
        ],
    },
    {
        eyebrow: "After The Install",
        title: "Open the admin page and finish setup",
        description: "When the script is done, open the admin link in your browser and finish the last few steps there.",
        highlights: [
            "You get the public domain, admin URL, and installer URL.",
            "The admin screen is where you finish the setup.",
            "Once that is done, the site is ready to use.",
        ],
    },
];
