import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/images/products/:path*",
        destination: "http://localhost:8000/images/products/:path*",
      },
    ];
  },
};

export default nextConfig;
