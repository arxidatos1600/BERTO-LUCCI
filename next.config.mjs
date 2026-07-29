import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the file-tracing root to THIS project so a stray lockfile in a parent
  // directory (e.g. C:/Users/USER/Downloads/package-lock.json) can't be mistaken
  // for the workspace root.
  outputFileTracingRoot: __dirname,

  // Don't advertise the framework.
  poweredByHeader: false,

  // Product imagery is served from local /public paths (downloaded) with a
  // remote Shopify CDN fallback handled in <SmartImage>. We use plain <img>,
  // so Next's image optimizer is left unconfigured/unoptimized by design.
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }],
  },

  // Baseline security headers. (A strict Content-Security-Policy is intentionally
  // omitted here because the store embeds a Google Maps iframe and Next injects
  // inline runtime; a CSP should be introduced with nonce support and tested.)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
