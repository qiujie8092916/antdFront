import { i18n } from '@lingui/core';
import { useCreation, useMemoizedFn } from 'ahooks';
import { Tabs } from 'antd';
import _ from 'lodash';
import memoized from 'nano-memoize';
import React, { Suspense, useRef } from 'react';
import type { Location } from 'react-router-dom';
import { generatePath, useLocation, useNavigate, useOutlet } from 'react-router-dom';

import RightContent from '@/components/PageContainer/RightContent';
import PageLoading from '@/components/PageLoading';
import { DynamicRouteMenu } from '@/config/routes';
import { getPageQuery } from '@/utils/route-utils';

import styles from './index.less';

type TabObjectType = {
  key: string;
  location: Location;
  page: React.ReactElement | null;
  params: Record<string, any>;
} & DynamicRouteMenu;

const { TabPane } = Tabs;

const getTabPath = (tab: TabObjectType) => generatePath(tab.location.pathname, tab.params);

// tab 的 select key = path?query#hash
// 以此解决 微端情况下 tab 的 key 相同导致页面可能丢失的问题。
const genKey = memoized(
  (path: string, query: Record<string, any>, hash: string) =>
    `${path}${
      Object.keys(query).length
        ? `?${Object.keys(query)
            .reduce((acc, cur) => `${cur}=${query[cur]}&`, '')
            .slice(1)}`
        : ''
    }${hash ?? ''}`
);

// 从key中返回 ,号后面的字符
const getTabMapKey = memoized((key: string) => key.substring(key.indexOf(',') + 1, key.length));

interface Props {
  matchPath: string;
  defaultTab: DynamicRouteMenu;
  routeConfig: DynamicRouteMenu;
}

const TabRoute: React.FC<Props> = ({ defaultTab, routeConfig, matchPath }) => {
  const ele = useOutlet();
  const params = getPageQuery();
  const navigate = useNavigate();
  const location = useLocation();

  // tabList 使用 ref ，避免二次render。
  // const [tabList, setTabList] = useSafeState([]);
  // tablist 结构为 key:matchPath,value:tabObject ;
  // key == location.pathname
  // tabObject中记录当下location。
  const tabList = useRef<Map<string, TabObjectType>>(
    new Map([
      [
        '/',
        {
          ...defaultTab,
          params: {},
          page: defaultTab.element,
          key: genKey('/', {}, location.search, ''),
          location: { pathname: '/', search: '', hash: '', state: null, key: 'default' }
        } as TabObjectType
      ]
    ])
  );

  // 确保tab
  /*
   * const updateTabList =
   */
  useCreation(() => {
    const tab = tabList.current.get(matchPath);
    const newTab: TabObjectType = {
      ...routeConfig,
      params,
      location,
      page: ele,
      name: routeConfig.name,
      key: genKey(matchPath, params, location.hash)
    };
    if (tab) {
      // 处理微前端情况，如发生路径修改则替换
      // 还要比较参数
      // 微端路由更新 如果key不更新的话。会导致页面丢失..
      if (tab.location.pathname !== location.pathname) {
        tabList.current.set(matchPath, newTab);
      }
    } else {
      tabList.current.set(matchPath, newTab);
    }
  }, [location]);

  const closeTab = useMemoizedFn((selectKey) => {
    // 记录原真实路由,微前端可能修改
    if (tabList.current.size >= 2) {
      tabList.current.delete(getTabMapKey(selectKey));
      const nextKey = _.last(Array.from(tabList.current.keys()));
      if (nextKey) {
        navigate(getTabPath(tabList.current.get(nextKey)!), { replace: true });
      }
    }
  });

  const selectTab = useMemoizedFn((selectKey) => {
    // 记录原真实路由,微前端可能修改
    navigate(getTabPath(tabList.current.get(getTabMapKey(selectKey))!), {
      replace: true
    });
  });

  const operations = React.useMemo(
    () => ({
      right: <RightContent />
    }),
    []
  );

  return (
    <Tabs
      hideAdd
      animated
      tabPosition='top'
      tabBarGutter={-1}
      type='editable-card'
      className={styles.tabs}
      tabBarExtraContent={operations}
      onChange={(key) => selectTab(key)}
      tabBarStyle={{ background: '#fff' }}
      onEdit={(targetKey) => closeTab(targetKey)}
      activeKey={genKey(matchPath, params, location.hash)}>
      {[...tabList.current.values()].map((item) => (
        <TabPane tab={i18n._(item.name)} key={item.key} closable={item.fullPath !== '/'}>
          <Suspense fallback={<PageLoading />}>{item.page}</Suspense>
        </TabPane>
      ))}
    </Tabs>
  );
};

export default TabRoute;
