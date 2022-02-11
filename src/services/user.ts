import replaceObjectKeys from '@pansy/replace-object-keys';
import { message } from 'antd';
import { stringify } from 'qs';
import { useNavigate } from 'react-router-dom';

import request from '@/utils/request';
import { getPageQuery } from '@/utils/route-utils';
import { removeUserToken } from '@/utils/storage';

/** API: 查询当前用户信息 */
export async function queryCurrent(): Promise<any> {
  return request('/user/info').then((res: any) => {
    const data = res?.data;
    if (!data) return data;

    const { user, departments } = data;

    const dept = replaceObjectKeys(departments, {
      departmentId: 'id',
      departmentName: 'name',
      photoUrl: 'avatar'
    });

    const group = dept && dept.length ? dept : [{ id: '0', name: 'JoJo Reading', avatar: '' }];
    return {
      group,
      ...replaceObjectKeys(
        user,
        {
          photoUrl: 'avatar',
          userName: 'name',
          name: 'firstName',
          surname: 'lastName',
          position: 'title'
        },
        { simplify: false }
      )
    };
  });
}

/** API: 退出登录 */
export async function fakeAccountLogout(params?: any) {
  return request('/login/logout', { method: 'POST', data: params }).then((res: any) => {
    const { status, errorMsg } = res || {};
    if (status === 'OK') {
      const { redirect } = getPageQuery(); // redirect
      if (window.location.pathname !== '/user/login' && !redirect) {
        // 移除token
        removeUserToken();
        const navigate = useNavigate();
        // history.replace({
        //   pathname: '/user/login',
        //   search: stringify({ redirect: window.location.href })
        // });
        navigate('/user/login', {
          replace: true,
          state: { search: stringify({ redirect: window.location.href }) }
        });
      }
    } else {
      message.error(errorMsg || '退出失败！');
    }
  });
}
