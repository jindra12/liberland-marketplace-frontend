/** @type {import('next').NextConfig} */
const nextConfig = {
    env: Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith("REACT_APP_"))),
    webpack(config) {
        config.module.rules.push({
            test: /\.md$/i,
            type: "asset/source",
        });

        return config;
    },
};

module.exports = nextConfig;
