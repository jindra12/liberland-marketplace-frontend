const webpack = require("webpack");

module.exports = function override(config) {
    config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        stream: require.resolve("stream-browserify"),
        crypto: require.resolve("crypto-browserify"),
        buffer: require.resolve("buffer/"),
        process: require.resolve("process/browser"),
        vm: require.resolve("vm-browserify"),
        
    };

    config.plugins = [
        ...(config.plugins || []),
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        }),
    ];

    config.module.rules[0].resolve = {
        fullySpecified: false,
    };

    return config;
};
