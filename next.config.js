/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: "dist",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.firebasestorage.googleapis.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["antd", "@ant-design/icons"],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
  turbopack: {},
};

module.exports = nextConfig;
