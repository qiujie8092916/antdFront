import request from '@woulsl/request';
import { notification } from 'antd';

import { APP_KEY, authBaseURL as baseURL } from '@/config/base';

import { getAuthority } from './authority';
import { getUserToken } from './storage';

export interface HeadersType {
  Authorization?: string;
  applicationKey?: string;
  resourceKey?: string;
  token?: string;
  [propName: string]: any;
}
export interface ConfigType {
  action: string;
  headers?: HeadersType;
  key?: string;
}

export interface XhrOptionsType {
  method?: 'POST' | 'GET' | 'PUT';
  baseURL?: string;
  data?: any;
  headers?: HeadersType;
  /** 资源 KEY 即权限 KEY */
  key?: string;
}

const getApiAuthority = (authority: string[] | string) => {
  const currentAuthority = getAuthority();

  const auth = typeof authority === 'string' ? [authority] : authority;

  return [currentAuthority].flat().some((item: string) => auth.includes(item));
};
/**
 * 配置request请求时的默认参数
 */

export const xhr = request.create({
  baseURL,
  timeout: 10000, // 超时
  // useCache:true,//是否使用缓存
  maxCache: 100, // 最大缓存数
  // ttl:600000,//缓存时长
  // prefix: '',
  // suffix:'',
  headers: {
    // Authorization: `Bearer ${token}`,
  },
  credentials: 'include', // 默认请求是否带上cookie
  responseType: 'json', // 响应数据
  mode: 'cors' // same-origin|cors|no-cors|cors-with-forced-preflight
});

// 权限拦截处理
xhr.interceptors.request.use((config: ConfigType) => {
  let { headers = {} } = config;
  const { action } = config;

  const { resourceKey } = headers;

  // 需要权限验证
  if (resourceKey) {
    const res = getApiAuthority(resourceKey);
    if (!res) {
      // 未通过授权验证
      // message.error('无操作权限');
      Promise.reject(
        new Error(`[No Permission] Url: ${baseURL}${action} ResourceKey: ${resourceKey}`)
        // eslint-disable-next-line no-console
      ).catch((e) => console.error(e));

      return null;
    }
  }
  //
  headers = {
    ...headers,
    applicationKey: APP_KEY,
    token: getUserToken(),
    resourceKey
  };
  const nextConfig: any = { ...config, action, headers };
  const { data, params, method } = nextConfig;
  Reflect.deleteProperty(nextConfig, 'params');
  return {
    ...nextConfig,
    data: method === 'get' ? params || data : data
  };
});

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。'
};
// 响应拦截
xhr.interceptors.response.use((result: Record<string, any>) => {
  const { res } = result as any;

  // 销毁只显示一个
  notification.destroy();
  //
  if (res && res.status) {
    const { status, url, statusText } = res;
    const errorText = codeMessage[status] || statusText;
    //
    if ([401, 403, 404, 406, 410, 422, 500, 502, 503, 504].includes(status)) {
      // 过滤获取用户信息在401时报错提示

      // /user/info /application/user/all
      if (!(/\/user\/info|\/application\/user\/all$/.test(url.split('?')[0]) && status === 401)) {
        //
        notification.error({
          message: `请求错误 ${status}: ${url}`,
          description: errorText
        });
      }
    }

    // if (status === 200 && data && data.status === 'ERROR') {
    //   notification.error({
    //     message: `请求错误 500: ${url}`,
    //     description: data.errorMsg || codeMessage[500],
    //   });
    // }
  } else if (!res) {
    notification.error({
      message: '网络异常',
      description: '您的网络发生异常，无法连接服务器'
    });
  }

  return result;
});

// 遵循与umi-request规则一致，作出部分调
export default (action: string, options?: XhrOptionsType): Promise<any> => {
  return (
    xhr({ action, ...(options || {}) })
      // eslint-disable-next-line consistent-return
      .then((result: any) => {
        // @ts-ignore
        if (result) {
          const { data, res } = result;
          if (res?.ok) return data;
        }
        // TODO: 此处逻辑有误，并非超时后提示消息
        // notification.error({
        //   message: `连接超时`,
        //   description: '连接超时，请检查网络',
        // });
      })
      // eslint-disable-next-line no-console
      .catch((e: any) => console.error(e))
  );
};
