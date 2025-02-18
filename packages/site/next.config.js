const withSvgr = require('next-svgr');

module.exports = withSvgr({
  // reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      ox: false,
      'ox/BlockOverrides': false,
      'ox/AbiConstructor': false,
      'ox/AbiFunction': false,
    };
    return config;
  },
  async headers() {
    return [
      {
        // Match video request paths
        source: '/s5/(.*)', // Adjust this if your video paths differ
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Replace '*' with your domain for stricter security
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Range, Content-Type',
          },
          {
            key: 'Access-Control-Expose-Headers',
            value: 'Content-Length, Content-Range',
          },
        ],
      },
      {
        // Other headers, such as for the root path
        source: '/',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
});
