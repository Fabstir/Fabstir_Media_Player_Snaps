const path = require('path');
const withSvgr = require('next-svgr');

module.exports = withSvgr({
  webpack: (config) => {
    // Apply fallback configuration for missing modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      ox: false, // fallback for the top-level 'ox'
      'ox/BlockOverrides': false,
      'ox/AbiConstructor': false,
      'ox/AbiFunction': false,
    };

    // Alias 'ox' and its submodules to our empty module
    config.resolve.alias = {
      ...config.resolve.alias,
      ox: path.resolve(__dirname, 'empty.js'),
      'ox/BlockOverrides': path.resolve(__dirname, 'empty.js'),
      'ox/AbiConstructor': path.resolve(__dirname, 'empty.js'),
      'ox/AbiFunction': path.resolve(__dirname, 'empty.js'),
    };

    return config;
  },
  async headers() {
    return [
      {
        source: '/s5/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, HEAD, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Range, Content-Type' },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'Content-Length, Content-Range',
          },
        ],
      },
      {
        source: '/',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
});
