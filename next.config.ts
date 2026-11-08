import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // The RTS Tracker is a single-page app built into public/tracker. Real files (JS, CSS, images) are served first;
      // any other /tracker path falls back to its index.html so deep links such as /tracker/signup work.
      fallback: [{ source: "/tracker/:path*", destination: "/tracker/index.html" }],
    };
  },
};

export default nextConfig;