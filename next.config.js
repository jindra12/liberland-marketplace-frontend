/** @type {import('next').NextConfig} */
const nextConfig = {
    env: Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith("REACT_APP_"))),
};

module.exports = nextConfig;
