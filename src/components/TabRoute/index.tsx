import { i18n } from '@lingui/core';
import { useCreation, useMemoizedFn } from 'ahooks';
import { useMount } from 'ahooks';
import { Tabs } from 'antd';
// import _ from 'lodash';
import memoized from 'nano-memoize';
import React /* , { Suspense,  useRef } */ from 'react';
import type { Location } from 'react-router-dom';
import { generatePath, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import { tabMenusAtom } from '@/atoms/tabs';
import RightContent from '@/components/PageContainer/RightContent';
// import PageLoading from '@/components/PageLoading';
import { DynamicRouteMenu } from '@/config/routes';
import { INDEX_CONSTANT, isIndex } from '@/layouts/BasicLayout';
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

const getRouteIndex = (tabList: any[], key: string): any => {
  return tabList.findIndex((tab) => tab.key === key);
};

const getRouteItem = (tabList: any[], key: string): any => {
  return tabList.find((tab) => tab.key === key)?.tabObject;
};

const TabRoute: React.FC<Props> = ({ defaultTab, routeConfig, matchPath }) => {
  const ele = useOutlet();
  const params = getPageQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const [tabList, setTabList] = useRecoilState(tabMenusAtom);

  // tabList 使用 ref ，避免二次render。
  // const [tabList, setTabList] = useSafeState([]);
  // tablist 结构为 key:matchPath,value:tabObject ;
  // key == location.pathname
  // tabObject中记录当下location。
  // const tabList = useRef<Map<string, TabObjectType>>(
  //
  // );

  useMount(() => {
    setTabList([
      {
        key: INDEX_CONSTANT,
        tabObject: {
          ...defaultTab,
          params: {},
          page: defaultTab.element,
          key: genKey(INDEX_CONSTANT, {}, location.search, ''),
          location: {
            pathname: INDEX_CONSTANT,
            search: '',
            hash: '',
            state: null,
            key: 'default'
          }
        } as TabObjectType
      }
    ]);
  });

  // 确保tab
  /*
   * const updateTabList =
   */
  useCreation(() => {
    const tab = getRouteItem(tabList, isIndex(matchPath) ? INDEX_CONSTANT : matchPath);

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
      if (!isIndex(matchPath) && tab.location.pathname !== location.pathname) {
        // tabList.set(matchPath, newTab);
        setTabList((tl: any) => [
          ...tl,
          {
            key: matchPath,
            tabObject: newTab
          }
        ]);
      }
    } else {
      // tabList.set(matchPath, newTab);
      setTabList((tl: any) => [
        ...tl,
        {
          key: matchPath,
          tabObject: newTab
        }
      ]);
      // setTabList((tl: any) => tl.set(matchPath, newTab));
    }
  }, [location]);

  const closeTab = useMemoizedFn((selectKey) => {
    // 记录原真实路由,微前端可能修改
    if (tabList.length >= 2) {
      // delete tabList[getTabMapKey(selectKey)];
      const index = getRouteIndex(tabList, getTabMapKey(selectKey));
      if (index !== undefined) {
        tabList.splice(index, 1);
      }
      const nextKey = tabList[tabList.length - 1].key; // _.last(Array.from(tabList.keys()));
      if (nextKey) {
        navigate(getTabPath(getRouteItem(tabList, nextKey)!), { replace: true });
      }
    }
  });

  // 记录原真实路由,微前端可能修改
  const selectTab = useMemoizedFn((selectKey) =>
    // navigate(getTabPath(tabList.get(getTabMapKey(selectKey))!))
    navigate(getTabPath(getRouteItem(tabList, getTabMapKey(selectKey))!))
  );

  const operations = React.useMemo(
    () => ({
      right: <RightContent />
    }),
    []
  );

  console.log('TabRoute tabList', tabList);
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
      {/* {[...tabList.current.values()].map((item) => ( */}
      {[...tabList].map((item) => (
        <TabPane
          tab={i18n._(item.tabObject.name)}
          key={item.key}
          closable={item.tabObject.fullPath !== INDEX_CONSTANT}>
          {/* <Suspense fallback={<PageLoading />}>{item.page}</Suspense> */}
        </TabPane>
      ))}
    </Tabs>
  );
};

export default TabRoute;
