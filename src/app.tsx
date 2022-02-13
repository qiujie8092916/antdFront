import { useFavicon, useMount, useRequest, useUnmount } from 'ahooks';
import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Menu, menuAtom } from '@/atoms/menu';
import { appRouteAtom } from '@/atoms/route';
import Locale from '@/components/Locale';
import PageLoading from '@/components/PageLoading';
import { queryUserApplication } from '@/services/application';

const App: React.FC = () => {
  useFavicon('./public/favicon.ico');

  // 父路由伟/* 子路由为/ 无法导航 至子组件 是个bug

  const appRoute = useRecoilValue(appRouteAtom);
  const [, setMenuAtom] = useRecoilState(menuAtom);

  const element = useRoutes(appRoute);

  const { run: getUserApplication, cancel: cancelGetUserApplication } = useRequest(
    queryUserApplication,
    {
      manual: true,
      onSuccess: (data: Menu) => setMenuAtom(data)
    }
  );

  useMount(() => {
    getUserApplication();
  });

  useUnmount(() => {
    cancelGetUserApplication();
  });
  return (
    <Suspense fallback={<PageLoading />}>
      <Locale>{element}</Locale>
    </Suspense>
  );
};

export default App;
