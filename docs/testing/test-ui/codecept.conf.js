/** @type {CodeceptJS.MainConfig} */

export const config = {
  tests: "./tests/**/*.js",

  output: "./output",

  helpers: {
    Playwright: {
      browser: "chromium",
      url: process.env.BASE_URL || "http://localhost:3000",
      show: true
    }
  },

  include: {
    I: "./steps_file.js"
  },

  noGlobals: true,

  plugins: {},

  name: "test-ui"
};