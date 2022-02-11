// import replaceObjectKeys from '@pansy/replace-object-keys';
import { atom, selector } from 'recoil';

import {
  dynamicConfig,
  generateRouteWithMenuTypes,
  getAppsMenu,
  mergeRoute,
  staticConfig
} from '@/utils/route-utils';

import { haveApplicationsSelector } from './menu';

// 通常权限只更新menu的route 故 在此做区分。
// 基本不变的路由为 staticRoute.
// 根据用户角色改变而发生变化的为 dynamicRoute
// 两者的集合为appRoute

export const staticConfigAtom = atom({
  key: 'staticConfigAtom',
  default: staticConfig
});

export const dynamicConfigAtom = atom({
  key: 'dynamicConfigAtom',
  default: dynamicConfig
});

const rmtConfigAtom = selector({
  key: 'rmtConfigAtom',
  get: ({ get }) =>
    generateRouteWithMenuTypes(
      get(staticConfigAtom) ?? [],
      (get(dynamicConfigAtom) ?? []).concat(
        // replaceObjectKeys(
        getAppsMenu(get(haveApplicationsSelector))
        /* ,
          { logoUrl: 'icon', routes: 'children' },
          { simplify: false, childrenKey: 'children' }

        )
        */
      )
    )
});

export const staticRouteAtom = selector({
  key: 'staticRouteAtom',
  get: ({ get }) => get(rmtConfigAtom)?.staticRoute
});

export const dynamicRouteAtom = selector({
  key: 'dynamicRouteAtom',
  get: ({ get }) => get(rmtConfigAtom)?.menuTabs
});

export const appRouteAtom = selector({
  key: 'appRouteAtom',
  get: ({ get }) =>
    // 寻找menuTabs标志
    mergeRoute(get(staticRouteAtom) ?? [], get(dynamicRouteAtom) ?? [])
});
