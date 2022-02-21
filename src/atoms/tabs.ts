import { atom /* , selector */ } from 'recoil';

import { storage } from '@/utils/storage';

// 通常权限只更新menu的route 故 在此做区分。
// 基本不变的路由为 staticRoute.
// 根据用户角色改变而发生变化的为 dynamicRoute
// 两者的集合为appRoute
const TAB_MENU_CACHE_KEY = `${process.env.ENV_NAME}_MASTER_TAB_MENUS`.toUpperCase();

export const tabMenusAtom = atom({
  key: 'tabMenusAtom',
  default: storage.get(TAB_MENU_CACHE_KEY) ?? []
});
