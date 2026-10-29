import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['motion', 'framer-motion'],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/schedule",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
