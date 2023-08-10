/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;

// for react95
const withFonts = require("next-fonts");
const withTM = require("next-transpile-modules")([
  "@react95/core",
  "@react95/icons",
]);

module.exports = withTM(withFonts());
