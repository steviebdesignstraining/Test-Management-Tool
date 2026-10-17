import type { NextConfig } from "next";

const isStaticExport = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  basePath: isStaticExport ? "/Test-Management-Tool" : "",
  assetPrefix: isStaticExport ? "/Test-Management-Tool/" : "",
  trailingSlash: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
