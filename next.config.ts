import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ifcykdqekthnpzzgmtgv.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "batuhan-arioz",
  project: "dentist-panel",
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
});
