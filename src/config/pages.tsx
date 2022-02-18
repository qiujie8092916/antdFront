import _ from 'lodash';
import memoized from 'nano-memoize';
import React, { lazy } from 'react';
import { Outlet } from 'react-router-dom';

import Access from '@/components/Access';
import AccessResult from '@/components/AccessResult';
import { isHttp } from '@/utils/is';

const Dashboard = lazy(() => import('@/pages/dashboard'));
const UserLogin = lazy(() => import('@/pages/user/login'));
const MicroApp = lazy(() => import('@/components/MicroApp'));
const UserLayout = lazy(() => import('@/layouts/UserLayout'));
const BasicLayout = lazy(() => import('@/layouts/BasicLayout'));
const SecurityLayout = lazy(() => import('@/layouts/SecurityLayout'));
const Test1 = lazy(() => import('@/pages/test1'));

const pages: Map<string, React.ReactElement> = new Map([
  ['Default', <Outlet />], // default microapp
  ['Dashboard', <Dashboard />],
  ['UserLogin', <UserLogin />],
  ['UserLayout', <UserLayout />],
  ['BasicLayout', <BasicLayout />],
  ['SecurityLayout', <SecurityLayout />],
  ['Test1', <Test1 />]
]);

type GetPageProps = {
  pageStr: string;
  access?: string;
  fullPath?: string;
  microApp?: string;
};

const getPage = memoized(({ pageStr, access, fullPath, microApp = '' }: GetPageProps) => {
  const page = isHttp(pageStr) ? (
    <MicroApp entry={pageStr} appKey={microApp} fullPath={fullPath ?? ''} />
  ) : (
    pages.get(_.upperFirst(pageStr))
  );
  if (access) {
    return (
      <Access accessible={access} fallback={<AccessResult code='403' />}>
        {page}
      </Access>
    );
  }
  return page;
});

export default getPage;
