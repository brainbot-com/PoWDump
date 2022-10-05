/** @type {import('next').NextConfig} */
const withImages = require('next-images')
const nextBuildId = require('next-build-id')

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    disableStaticImages: true,
  },

  publicRuntimeConfig: {
    build: nextBuildId.sync({ dir: __dirname, describe: true  }),
  }
}

module.exports = withImages(nextConfig)
