import request from '@/utils/request';

export interface LoginParamsType {
  account: string;
  password: string;
  token: string;
  type?: string;
}

/** API: 帐号登录 */
export async function fakeAccountLogin(params: LoginParamsType) {
  const { type } = params;
  const pathname = type === 'account' ? '/login/account_password' : '/login/verify/code';
  return request(pathname, { method: 'POST', data: params });
}

/** API: 获取钉钉扫码配置信息 */
export async function queryDingConf(params?: any): Promise<any> {
  return request('/login/dingTalk/appId', { data: params });
}

/** API: 手机号登录获取验证码 */
export async function getFakeCaptcha(data: { mobile: string }) {
  return request(`/login/send/code`, { method: 'POST', data });
}
