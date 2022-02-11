// @ts-ignore
import storage from '@woulsl/storage';
// @ts-ignore
import session from '@woulsl/storage/session';

// import { APP_KEY } from '../../config/base';

// 应用key
// const platform: string = APP_KEY;

// 区分环境和应用
export const AUTHORITY_KEY = `${process.env.ENV_NAME}_AUTHORITY_KEY`.toUpperCase();
export const USER_TOKEN = `${process.env.ENV_NAME}_USER_TOKEN`.toUpperCase();

// 存储使用session方式
const storageCache = storage;
// 存储过期时间
const storageExpireTime = -1; // 永久存储

// 设置user token
export function setUserToken(token: string) {
  if (!token) {
    console.warn('no token value');
    return;
  }
  storageCache.set(USER_TOKEN, token, storageExpireTime);
}

// 获取user token
export function getUserToken() {
  return storageCache.get(USER_TOKEN);
}

/** 删除用户TOKEN */
export function removeUserToken() {
  // 通知子应用用户信息删除
  // window.pushSlaveMessage('keep.user.storage.remove');

  storageCache.remove(USER_TOKEN);
}

export { session, storage };

// 改写，添加用户token
const defaults = (store: any) => {
  const methods = {};
  ['get', 'set', 'remove'].forEach((method) => {
    // eslint-disable-next-line func-names
    methods[method] = function (...args: any) {
      //
      const key = args[0];
      const token = getUserToken() || '';
      // eslint-disable-next-line no-param-reassign
      args[0] = [token, key].join('|');
      //
      return store[method].apply(null, args);
    };
  });

  //
  return {
    ...methods,
    clear: store.clear
  };
};

export default defaults(storage);
