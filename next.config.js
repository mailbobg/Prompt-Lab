/** @type {import('next').NextConfig} */
const nextConfig = {
  // 支持静态导出（用于Electron）
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // 如果需要支持SSG
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
}

module.exports = nextConfig