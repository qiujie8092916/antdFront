import { useRequest } from 'ahooks';
import { message } from 'antd';
import { stringify } from 'qs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { fakeAccountLogout } from '@/services/user';
import { setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';
import { getPageQuery } from '@/utils/route-utils';
import { removeUserToken, setUserToken } from '@/utils/storage';

import { fakeAccountLogin } from './service';

const loginType = process.env.ENV_NAME === 'dev' ? 'account' : 'qrcode';

function useLogin() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'ok' | 'error'>();
  const [type, setType] = useState<'mobile' | 'qrcode' | 'account'>(loginType);
  // 登录成功后重定向
  const authRedirect = (payload?: any) => {
    const urlParams = new URL(window.location.href);
    const params: Record<string, any> = getPageQuery();
    const { token: urlToken } = params;
    let { redirect } = params;

    const token = payload || urlToken;

    if (!token) return;
    setUserToken(token);
    reloadAuthorized();
    if (redirect) {
      const redirectUrlParams = new URL(redirect);

      // TODO: 临时由登录处理统一给url加token参数以便子应用流入 token 到 localStorage
      // TODO: 后期由子应用在登录时统一参应用key参数后，由此处统一注入，或优化权限模板中工具函数storage，采用统一的token
      // 给 url 添加 token 参数
      // redirect = `${redirect}${redirect.includes('?') ? '&' : '?'}token=${token}`;

      // 不同域名地址跳转方式
      if (redirectUrlParams.origin === urlParams.origin) {
        redirect = redirect.slice(urlParams.origin.length);

        if (redirect.match(/^\/.*#/)) {
          redirect = redirect.slice(redirect.indexOf('#') + 1);
        }
      } else {
        // 当前本应用路由跳转方式
        // redirect = `${redirect}${redirect.includes('?') ? '&' : '?'}token=${token}`;
        // window.location.href = redirect;
        // return;
      }
    }
    // history.replace(redirect || '/');
    window.location.href = redirect || '/'; // 主应用需要重新加载，动态注入子应用
  };

  const { loading: loginLoading, run: login } = useRequest(fakeAccountLogin, {
    manual: true,
    onSuccess: (res: any, params: any[]) => {
      const { status: st, data: token, currentAuthority } = res;

      setStatus(st === 'OK' ? 'ok' : 'error');
      setType(params[0]?.type);

      if (currentAuthority) setAuthority(currentAuthority || ['admin']);
      reloadAuthorized();
      if (token) setUserToken(token);

      // Login successfully
      if (st === 'OK') authRedirect(token);
    }
  });

  const { run: logout } = useRequest(fakeAccountLogout, {
    manual: true,
    onSuccess: (res: any) => {
      const { status: logoutStatus, errorMsg } = res || {};
      if (logoutStatus === 'OK') {
        const { redirect } = getPageQuery(); // redirect
        if (window.location.pathname !== '/user/login' && !redirect) {
          // 移除token
          removeUserToken();
          navigate(`/user/login?${stringify({ redirect: window.location.href })}`);
        }
      } else {
        message.error(errorMsg || '退出失败！');
      }
    },
    onError: () => message.error('退出失败！')
  });

  return { status, type, setType, login, logout, loginLoading, authRedirect };
}

export { useLogin };
