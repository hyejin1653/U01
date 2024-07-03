const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:9013/api",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
      "/file": {
        target: "http://118.38.20.105:8000",
        changeOrigin: true,
        pathRewrite: {
          "^/file": "",
        },
      },
      "/route": {
        target: "http://106.248.228.114:56080/api",
        changeOrigin: true,
        pathRewrite: {
          "^/route": "",
        },
      },
    },
  },

  //outputDir: "../backend/public",
});
