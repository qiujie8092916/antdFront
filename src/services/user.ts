import replaceObjectKeys from '@pansy/replace-object-keys';

import request from '@/utils/request';

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
  return request('/login/logout', { method: 'POST', data: params });
}
