/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
};

module.exports = nextConfig;
