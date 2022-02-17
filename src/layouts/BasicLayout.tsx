import ProLayout from '@ant-design/pro-layout';
import { useCreation } from 'ahooks';
import _ from 'lodash';
import memoized from 'nano-memoize';
import React, { useMemo } from 'react';
import { matchRoutes, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import logo from '@/assets/logo.svg';
import logoText from '@/assets/logo-text.svg';
import { curLangAtom } from '@/atoms/locale';
import { dynamicRouteAtom } from '@/atoms/route';
import TabRoute from '@/components/TabRoute';
import proSettings from '@/config/defaultSettings';
import { DynamicRouteMenu } from '@/config/routes';
import { translateNameProperty } from '@/utils/route-utils';

import styles from './BasicLayout.less';

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
  const route = useCreation(() => translateNameProperty(dynamicRoute ?? []), [curLang]);

  const { routeConfig, matchPath } = useMemo(
    () => pickRoutes(route, location.pathname),
    [location.pathname]
  );

  const { routeConfig: defaultConfig } = useMemo(() => pickRoutes(route, '/'), ['/']);

  console.log('route', route);

  return (
    <div className={styles.prolayout} key='prolayout'>
      <ProLayout
        headerRender={false}
        style={{ height: '100vh' }}
        contentStyle={{ margin: 0 }}
        menuDataRender={() => route}
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
          <div id='customize_menu_header' className={styles.logo} onClick={() => navigate('/')}>
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
        {/* </PageContainer> */}
      </ProLayout>
    </div>
  );
};

export default BasicLayout;
