import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() { return [
    ...['models','media'].map(folder => ({source:'/'+folder+'/v/:hash/:path*',headers:[{key:'Cache-Control',value:'public, max-age=31536000, immutable'}]})),
    {source:'/sw.js',headers:[{key:'Cache-Control',value:'no-cache'},{key:'Service-Worker-Allowed',value:'/'}]},
  ]; },
  // Lets a second build sit beside the default one (used by the audit harness).
  distDir: process.env.NEXT_DIST_DIR || '.next',
}

export default nextConfig
