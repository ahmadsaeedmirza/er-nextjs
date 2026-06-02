import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/images/products/:path*",
        destination: `${backendUrl}/images/products/:path*`,
      },
    ];
  },
};

export default nextConfig;
