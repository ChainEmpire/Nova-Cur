
const webpack = require('webpack');

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack(config, { isServer }) {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      url: require.resolve('url'),
      buffer: require.resolve('buffer'),
      process: false,
    };

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'process/browser': require.resolve('process/browser.js'),
    };

    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser.js',
        Buffer: ['buffer', 'Buffer'],
      })
    );


    if (process.env.NODE_ENV !== 'production') {
      try {
        config.cache = { type: 'memory' };
      } catch (e) {

      }
    }


    config.ignoreWarnings = config.ignoreWarnings || [];
    config.ignoreWarnings.push((warning) => {
      if (warning && warning.module && warning.module.resource && warning.message) {
        return /[\\/]node_modules[\\/]ox[\\/]_esm[\\/]tempo/.test(warning.module.resource) && /Critical dependency/.test(warning.message);
      }
      return false;
    });

    return config;
  },
};

module.exports = nextConfig;
