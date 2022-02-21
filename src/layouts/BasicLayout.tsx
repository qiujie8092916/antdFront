import ProLayout from '@ant-design/pro-layout';
import { useCreation, useWhyDidYouUpdate } from 'ahooks';
import _ from 'lodash';
import memoized from 'nano-memoize';
import React, { Suspense, useMemo } from 'react';
import { matchRoutes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import logo from '@/assets/logo.svg';
import logoText from '@/assets/logo-text.svg';
import { curLangAtom } from '@/atoms/locale';
import { dynamicRouteAtom } from '@/atoms/route';
import { tabMenusAtom } from '@/atoms/tabs';
import PageLoading from '@/components/PageLoading';
import TabRoute from '@/components/TabRoute';
import proSettings from '@/config/defaultSettings';
import { DynamicRouteMenu } from '@/config/routes';
import { translateNameProperty } from '@/utils/route-utils';

import styles from './BasicLayout.less';

export const INDEX_CONSTANT = '/index';

export const isIndex = (pathname: string) =>
  ['/', '/index', '/dashboard/workplace'].includes(pathname);

// 从 config 里 把 匹配的信息 调出来
// 放这因为 activekey 在 prolayout 和 tabroute 之间共享。
const pickRoutes = memoized((routes: DynamicRouteMenu[], pathname: string) => {
  const matches = matchRoutes(routes, { pathname });
  const routeConfig: any = matches ? matches[matches.length - 1].route : null;
  return {
    routeConfig,
    // matchPath: matches ? matches.map(match => _.replace(match.route.path,'/*','')).join('/') : null // 解决下微端/*路径的问题
    matchPath: routeConfig ? _.replace(routeConfig.fullPath, '/*', '') : null
  };
});

const BasicLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const curLang = useRecoilValue(curLangAtom);
  const dynamicRoute = useRecoilValue(dynamicRouteAtom);
  const tabList = useRecoilValue(tabMenusAtom);
  const route = useCreation(() => translateNameProperty(dynamicRoute ?? []), [curLang]);

  const { routeConfig, matchPath } = useMemo(
    () => pickRoutes(route, location.pathname),
    [location.pathname]
  );

  const { routeConfig: defaultConfig } = useMemo(
    () => pickRoutes(route, INDEX_CONSTANT),
    [INDEX_CONSTANT]
  );

  console.log('route', route);

  useWhyDidYouUpdate('BasicLayout', {
    location,
    navigate,
    curLang,
    dynamicRoute,
    route,
    routeConfig,
    matchPath,
    defaultConfig
  });

  if (isIndex(location.pathname) && location.pathname !== INDEX_CONSTANT) {
    return <Navigate to={INDEX_CONSTANT} replace />;
  }
  console.log('Basiclayout tabList', tabList);
  return (
    <div className={styles.prolayout} key='prolayout'>
      <ProLayout
        headerRender={false}
        style={{ height: '100vh' }}
        contentStyle={{ margin: 0 }}
        menuDataRender={() => route.filter((r) => !r.index)}
        menuProps={{
          mode: 'vertical',
          selectedKeys: [matchPath]
        }}
        menuItemRender={(item, dom) => (
          <div
            onClick={() => {
              // fullPath 为加工过 '/*' 的路径
              console.log('jump to page from sideBar', item.fullPath);
              navigate(item.fullPath);
            }}>
            {dom}
          </div>
        )}
        menuHeaderRender={() => (
          <div className={styles.logo} onClick={() => navigate(INDEX_CONSTANT)}>
            <img alt='logo' src={logo} />
            <h1>
              <img alt='logo-text' src={logoText} />
            </h1>
          </div>
        )}
        {...{
          ...proSettings,
          fixSiderbar: true,
          fixedHeader: true
        }}>
        {/* <PageContainer> */}
        <TabRoute routeConfig={routeConfig} matchPath={matchPath} defaultTab={defaultConfig} />
        {tabList.map((item: any) => {
          const { key, tabObject } = item;
          return (
            <div
              data-name={tabObject.path}
              key={`${tabObject.path}-${tabObject.timestamp || ''}`}
              style={location.pathname === key ? { display: 'block' } : { display: 'none' }}>
              <Suspense fallback={<PageLoading />}>{tabObject.page}</Suspense>
            </div>
          );
        })}
        {/* </PageContainer> */}
      </ProLayout>
    </div>
  );
};

export default BasicLayout;
