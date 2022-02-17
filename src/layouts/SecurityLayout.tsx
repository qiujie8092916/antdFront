import { PageLoading } from '@ant-design/pro-layout';
import { useMount, useRequest } from 'ahooks';
import { stringify } from 'querystring';
import React, { useMemo, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { CurrentUser, currentUserAtom } from '@/atoms/user';
import { queryCurrent } from '@/services/user';
import { getPageQuery } from '@/utils/route-utils';

const SecurityLayout: React.FC<{ children?: any }> = () => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useRecoilState<CurrentUser>(currentUserAtom);

  const isLogin = useMemo(() => currentUser && currentUser.name, [currentUser]);

  const { loading: fetchCurrentLoading, runAsync: fetchCurrent } = useRequest(queryCurrent, {
    manual: true
  });

  useMount(() => {
    fetchCurrent()
      .then((res: CurrentUser) => setCurrentUser(res))
      .finally(() => setIsReady(true));
  });

  // 你可以把它替换成你自己的登录认证规则（比如判断 token 是否存在）
  const query = getPageQuery();
  const queryString = stringify({ redirect: query?.redirect ?? window.location.href });

  if (!isReady || (!isLogin && fetchCurrentLoading)) {
    return <PageLoading />;
  }

  if (!isLogin) {
    return <Navigate to={{ pathname: `/user/login?${queryString}` }} replace={true} />;
  }

  return <Outlet />;
};

export default SecurityLayout;
