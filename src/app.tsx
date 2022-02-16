import { useFavicon, useMount, useRequest, useUnmount /* , useUpdateEffect */ } from 'ahooks';
// import { registerMicroApps } from 'qiankun';
import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Menu, menuAtom } from '@/atoms/menu';
import { appRouteAtom /* , dynamicRouteAtom */ } from '@/atoms/route';
import Locale from '@/components/Locale';
import PageLoading from '@/components/PageLoading';
// import { CUSTOM_NAV_PREFIX, MICROAPP_CONTAINER_ID } from '@/config/base';
import { queryUserApplication } from '@/services/application';

const App: React.FC = () => {
  useFavicon('./public/favicon.ico');

  // 父路由伟/* 子路由为/ 无法导航 至子组件 是个bug

  const appRoute = useRecoilValue(appRouteAtom);
  const setMenuAtom = useSetRecoilState(menuAtom);
  // const dynamicRoute = useRecoilValue(dynamicRouteAtom);

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

  // useUpdateEffect(() => {
  //   const microApps = (dynamicRoute ?? [])
  //     .filter((route) => route.microApp)
  //     .map((route) => ({
  //       name: route.microApp!,
  //       entry: route.entry!,
  //       container: `${MICROAPP_CONTAINER_ID}${route.microApp!}`,
  //       activeRule: `${CUSTOM_NAV_PREFIX}`
  //     }));
  //   console.log('registerMicroApps', microApps);
  //   registerMicroApps(microApps);
  // }, [dynamicRoute]);

  return (
    <Suspense fallback={<PageLoading />}>
      <Locale>{element}</Locale>
    </Suspense>
  );
};

export default App;
