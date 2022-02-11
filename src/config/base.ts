// const pkg = require('../../package.json');

// 是否调试模式
export const DEBUG = !!process.env.ENV_NAME && process.env.ENV_NAME !== 'pro';

// application key
export const APP_KEY = 'JOJO_GARDEN';

// 服务器端接口地址前缀
export const authBaseURL = '/api/oagw/';

export default { DEBUG, APP_KEY, authBaseURL };

// TODO: 环境变量处理，兼容旧应用与新应用迁移过渡，及开发调试环境下应用间调转适配
// TODO: 后期迁移完成后，涉及环境变量 env 的相关代码可删除
const isDev = process.env.NODE_ENV;

function getEnv() {
  const exp = /(-[dev|fat|uat]+-)|\.[dev|fat|uat]+\./;
  const { hostname } = window.location;
  const uEnv = hostname.match(exp)?.[0].replace(/[-.]/gi, '');

  // 如果环境变量与域名都没有环境参数，则默认设置为 pro
  return process.env.ENV_NAME || uEnv || 'pro';
}

export const ENV = getEnv();
export const ENV_DOT = ENV !== 'pro' ? `.${ENV}` : '';

// 统一地址前缀配置
export const ROOT_DOMAIN = isDev ? `https://admin${ENV_DOT}.xjjj.co` : '';

// 自定义路由前经
export const CUSTOM_NAV_PREFIX = '/micro';
