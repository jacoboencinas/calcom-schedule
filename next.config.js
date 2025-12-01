/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['node-fetch']
  },
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: '/api/:path*'
    }
  ]
}

module.exports = nextConfig
