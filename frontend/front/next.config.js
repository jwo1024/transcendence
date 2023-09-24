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


// //프록시 설정 테스트
// const proxy = require('http-proxy-middleware');

// module.exports = {
//   async rewrites() {
//     return [
//       {
//         source: '/chat',
//         destination: 'http://localhost:3000', // 백엔드 서버 URL
//       },
//     ];
//   },
//   async serverMiddleware() {
//     // 프록시 설정
//     const httpProxy = proxy('/chat', {
//       target: 'http://localhost:3000', // 백엔드 서버 URL
//       ws: true, // WebSocket 지원
//     });

//     return {
//       '/chat': httpProxy,
//     };
//   },
// };

// // // Webpack 설정을 변경
// // module.exports = {
// //   // 기존 설정들 ...

// //   webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
// //     // 기존 webpack 설정 유지

// //     // 아래 부분을 추가하여 해당 파일을 무시하도록 설정
// //     // config.module.rules.push({
// //     //   test: /\.eot$/,
// //     //   use: 'ignore-loader',
// //     // });
// //     config.module.rules.push({
// //       test: /\.eot$/,
// //       use: 'ignore-loader',
// //     });

// //     return config;
// //   },
// // };

// //통합테스트
// // const path = require("path");
// // const proxy = require('http-proxy-middleware'); // 프록시 설정을 위해 추가

// // module.exports = {
// //   reactStrictMode: true,

// //   webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
// //     // 기존 webpack 설정 유지

// //     // 아래 부분을 추가하여 .eot 파일을 file-loader로 처리하도록 설정
// //     config.module.rules.push({
// //       test: /\.eot$/,
// //       use: [
// //         {
// //           loader: "file-loader",
// //           options: {
// //             name: "[name].[ext]",
// //             outputPath: "static/fonts", // 파일을 저장할 경로
// //           },
// //         },
// //       ],
// //     });

// //     // .ttf 파일을 처리하는 로더도 추가
// //     config.module.rules.push({
// //       test: /\.ttf$/,
// //       use: [
// //         {
// //           loader: "file-loader",
// //           options: {
// //             name: "[name].[ext]",
// //             outputPath: "static/fonts", // 파일을 저장할 경로
// //           },
// //         },
// //       ],
// //     });

// //     return config;
// //   },

// //   // 프록시 설정을 아래에 추가
// //   async rewrites() {
// //     return [
// //       {
// //         source: '/chat',
// //         destination: 'http://localhost:3000', // 백엔드 서버 URL
// //       },
// //     ];
// //   },
// //   async serverMiddleware() {
// //     // 프록시 설정
// //     const httpProxy = proxy('/chat', {
// //       target: 'http://localhost:3000', // 백엔드 서버 URL
// //       ws: true, // WebSocket 지원
// //     });

// //     return {
// //       '/chat': httpProxy,
// //     };
// //   },
// // };
