import ProLayout from '@ant-design/pro-layout';
import defaultSettings from '@ant-design/pro-layout/es/defaultSettings';
import { useCreation } from 'ahooks';
import _ from 'lodash';
import memoized from 'nano-memoize';
import React from 'react';
import { matchRoutes, useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import logo from '@/assets/logo.svg';
import { curLangAtom } from '@/atoms/locale';
import { dynamicRouteAtom } from '@/atoms/route';
import TabRoute from '@/components/TabRoute';
import { DynamicRouteType } from '@/config/routes';
import { translateNameProperty } from '@/utils/route-utils';

import styles from './BasicLayout.less';

// 从config里 把 匹配的信息 调出来
// 放这因为activekey 在 prolayout 和 tabroute之间共享。
const pickRoutes = memoized((routes: DynamicRouteType[], pathname: string) => {
  const matches = matchRoutes(routes, { pathname });
  const routeConfig: any = matches ? matches[matches.length - 1].route : null;
  return {
    routeConfig,
    // matchPath: matches ? matches.map(match => _.replace(match.route.path,'/*','')).join('/') : null // 解决下微端/*路径的问题
    matchPath: routeConfig ? _.replace(routeConfig.key, '/*', '') : null
  };
});

const BasicLayout: React.FC = () => {
  const location = useLocation();
  const curLang = useRecoilValue(curLangAtom);
  const dynamicRoute = useRecoilValue(dynamicRouteAtom);

  const navigate = useNavigate();

  // const orgRoute = useRecoilValue(dynamicRouteAtom);

  // const route = useRecoilValue(transDynamicRouteAtom);
  const route = useCreation(() => translateNameProperty(dynamicRoute ?? []), [curLang]);
  // 手工转换下
  // transDynamicConfigAtom 貌似无法触发prolayout 的menu 更新，深表痛心。
  // const route = useCreation(
  //   () => translateNameProperty(orgRoute, locale),
  //   [orgRoute, locale],
  // );

  // 之所以要喂给单独深拷贝喂，因为 https://github.com/umijs/route-utils/pull/10 它好像挺倔，这么反人类的 底裤操作，居然不纠正...
  // const feedToProlayoutRoute = useCreation(() => {
  //   console.time('feedToProlayoutRoute');
  //   const a = _.cloneDeep(route);
  //   console.timeEnd('feedToProlayoutRoute');
  //   return a;
  // }, [curLang]);

  const { routeConfig, matchPath } = pickRoutes(route, location.pathname);

  return (
    <div id='prolayout' key='prolayout'>
      <ProLayout
        style={{
          height: '100vh'
        }}
        menuDataRender={() => route}
        menuItemRender={(item, dom) => (
          <div
            onClick={() => {
              // fullPath 为加工过 '/*' 的路径
              navigate(item.fullPath, { replace: true });
            }}>
            {' '}
            {dom}
          </div>
        )}
        selectedKeys={[matchPath]}
        menuHeaderRender={() => (
          <div
            id='customize_menu_header'
            className={styles.logo}
            onClick={() => {
              window.open('www.baidu.com');
            }}>
            <img src={logo} />
            <h1>Antd Front</h1>
          </div>
        )}
        headerRender={false}
        {...{
          ...defaultSettings,
          fixSiderbar: true,
          fixedHeader: true
        }}
        contentStyle={{
          margin: 0
        }}>
        {/* <PageContainer> */}
        <TabRoute routeConfig={routeConfig} matchPath={matchPath} />
        {/* </PageContainer> */}
      </ProLayout>
    </div>
  );
};

export default BasicLayout;
