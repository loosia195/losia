/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.losia.vn' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: 's3.amazonaws.com' },
    ],
    deviceSizes: [360, 540, 720, 960, 1080, 1440, 1920],
    imageSizes: [64, 96, 120, 180, 240, 270, 400, 533],
  },

  async headers() {
    return [
      {
        source: '/assets/:all*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/fonts/:all*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // 🔁 SVGR: cho phép import .svg như React component
  webpack(config) {
    // 2 rule: (1) SVG => React component (mặc định), (2) SVG?url => file URL
    config.module.rules.push(
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] }, // *.svg dùng SVGR
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              // Giữ viewBox để scale được; bỏ width/height cứng
              svgo: true,
              svgoConfig: {
                plugins: [
                  { name: 'removeViewBox', active: false },
                  { name: 'removeDimensions', active: true },
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.svg$/i,
        type: 'asset',              // *.svg?url → trả URL file (dùng cho <img> nếu cần)
        resourceQuery: /url/,
      }
    );
    return config;
  },
};

module.exports = nextConfig;
