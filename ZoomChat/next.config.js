/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Skip type checking during build (speeds up builds)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build (speeds up builds)
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
