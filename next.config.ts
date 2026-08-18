import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product, user and recipe imagery is served from the DummyJSON CDN.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.dummyjson.com", pathname: "/**" },
      { protocol: "https", hostname: "dummyjson.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
