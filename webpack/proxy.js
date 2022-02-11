module.exports = (ENV_NAME) => ({ // 配置代理（只在本地开发有效，上线无效）
  "/api/oagw/": { // 这是请求接口中要替换的标识
    target: `https://api.${ENV_NAME}.xjjj.co`, // 被替换的目标地址，即把 /api 替换成这个
    changeOrigin: true, // 加了这个属性，那后端收到的请求头中的host是目标地址 target
    // pathRewrite: {"/api" : ""}, // 后台在转接的时候url中是没有 /api 的
    // secure: false, // 若代理的地址是https协议，需要配置这个属性
  }
})
