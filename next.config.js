/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // ← add this
  experimental: {
    serverComponentsExternalPackages: ['@remotion/bundler', '@remotion/renderer'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig