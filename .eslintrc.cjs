module.exports = {
    extends: ["react-app", "react-app/jest"],
    overrides: [
        {
            files: ["src/components/**/*.tsx", "src/Main.tsx", "src/ShellPage.tsx"],
            plugins: ["import"],
            rules: {
                "react/react-in-jsx-scope": "error",
                "import/newline-after-import": ["error", { count: 1 }],
                "import/order": [
                    "error",
                    {
                        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                        pathGroups: [
                            {
                                pattern: "react",
                                group: "external",
                                position: "before",
                            },
                            {
                                pattern: "react-*",
                                group: "external",
                                position: "before",
                            },
                            {
                                pattern: "@*/react*",
                                group: "external",
                                position: "before",
                            },
                            {
                                pattern: "app/**",
                                group: "internal",
                                position: "before",
                            },
                        ],
                        pathGroupsExcludedImportTypes: [],
                        distinctGroup: true,
                        "newlines-between": "always",
                        alphabetize: {
                            order: "asc",
                            caseInsensitive: true,
                        },
                    },
                ],
                "max-len": [
                    "error",
                    {
                        code: 120,
                        ignoreUrls: true,
                        ignoreStrings: true,
                        ignoreTemplateLiterals: true,
                        ignoreRegExpLiterals: true,
                    },
                ],
                "no-restricted-syntax": [
                    "error",
                    {
                        selector: "ImportDeclaration[source.value='react'] ImportDefaultSpecifier",
                        message: 'Use `import * as React from "react";` in component files.',
                    },
                    {
                        selector: "ImportDeclaration[source.value='react'] ImportSpecifier",
                        message: "Use the `React` namespace instead of named imports from `react` in component files.",
                    },
                ],
                "import/no-default-export": "error",
            },
        },
        {
            files: [
                "src/Main.tsx",
                "src/ShellPage.tsx",
                "src/components/AppLayout.tsx",
                "src/components/AuthCallback.tsx",
                "src/components/Cart.tsx",
                "src/components/Companies.tsx",
                "src/components/Identities.tsx",
                "src/components/Jobs.tsx",
                "src/components/NotFound.tsx",
                "src/components/Order.tsx",
                "src/components/ProductsServices.tsx",
                "src/components/Profile.tsx",
                "src/components/Publish.tsx",
                "src/components/Splash.tsx",
                "src/components/Startups.tsx",
                "src/components/Syndication.tsx",
                "src/components/Unsubscribe/*.tsx",
                "src/components/detail/*.tsx",
                "src/components/edit/*.tsx",
            ],
            rules: {
                "import/no-default-export": "off",
            },
        },
    ],
}
