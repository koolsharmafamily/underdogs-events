import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Lets a second build sit beside the default one (used by the audit harness).
  distDir: process.env.NEXT_DIST_DIR || '.next',
}

export default nextConfig
