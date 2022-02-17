import { i18n } from '@lingui/core';
import _ from 'lodash';
import { parse } from 'querystring';
import { resolvePath } from 'react-router-dom';

import { CUSTOM_NAV_PREFIX } from '@/config/base';
import getIcon from '@/config/icons';
import getPage from '@/config/pages';
import type {
  DynamicRouteMenu,
  DynamicRouteType,
  RouteType,
  StaticRouteMenu,
  StaticRouteType
} from '@/config/routes';
import routeConfig from '@/config/routes';
import { Application, AppRoute } from '@/services/application';
import { isUrl } from '@/utils/is';
// import { t } from "@lingui/macro";
// 单独 拉出config 因为 修改route的时候，是按"@/config/routes"的格式提供的。
// 而后端不可能提供key，resolvepath之类的参数。
// staticConfig 以 menutabs 为标志。

export const getPageQuery = () => parse(window.location.search.split('?')[1] ?? '');

const normalizePathname = (pathname: string) => pathname.replace(/\/+$/, '').replace(/^\/*/, '/');

const { staticConf: sc, dynamicConf: dc } = extractRouteConfig(routeConfig);
export const staticConfig = sc;
export const dynamicConfig = dc;

function extractRouteConfig(rConfig: RouteType[]): {
  staticConf: StaticRouteType[] | null;
  dynamicConf: DynamicRouteType[] | null;
} {
  if (!rConfig) return { staticConf: null, dynamicConf: null };

  let dynamicConf: DynamicRouteType[] = [];
  const copyConfig = (config: RouteType[]): StaticRouteType[] =>
    config.map((conf) => {
      const { menuTabs, children, ...restProps } = conf;
      const route: StaticRouteType = {
        ...restProps
      };
      if (conf.children) {
        route.children = copyConfig(conf.children);
      } else {
        // 遇到menutabs 则 返回，将 静态和菜单的动态路由分开 ，由atom进行管理。
        if (!dynamicConf?.length && conf.menuTabs) {
          // 确保只添加一次。
          dynamicConf = _.cloneDeep(conf.menuTabs);
          route.menuTabs = true;
        }
      }

      return route;
    });

  return {
    staticConf: copyConfig(rConfig),
    dynamicConf: dynamicConf.length ? dynamicConf : null
  };
}

// 抽离的congfig 去生成route config 和 menuconfig

// const rmtConfig = generateRouteWithMenuTypes(staticConfig,dynamicConf);

// 通常权限只更新menu的route 故 在此做区分。
// 基本不变的路由为 staticRoute.
// 根据用户角色改变而发生变化的为 dynamicRoute
// 两者的集合为appRoute
// Generate App Route from config files 生成 route menu tabs config

// const generateAppRouteFromConfig = (defRoutes = routeConfig) => {
//   const [rmtConfig] = generateRoute(defRoutes);

//   return rmtConfig;
// };

// const rmtConfig = generateAppRouteFromConfig

// convert menutabs to prolayout's menudataitem
// menuTabs: [
//   {
//     path: "1",
//     element: "page1"
//   },
//   {
//     path: "2",
//     element: "page2",
//     children:[
//       {
//         path: "3",
//         element: "page3"
//       },
//       {
//         path: "4",
//         element: "page4"
//       },
//     ]
//   },
// ]

// 翻译下route的Name
export function translateNameProperty(route: DynamicRouteType[]): DynamicRouteType[] {
  const newRoute: DynamicRouteType[] = [];
  const transObjectName = (curRoute: DynamicRouteType) => {
    const newCurRoute = { ...curRoute };
    if (newCurRoute.name) {
      newCurRoute.name = i18n._(newCurRoute.name);
    }
    if (newCurRoute.children) {
      const newChildren: DynamicRouteType[] = [];
      newCurRoute.children.forEach((item) => {
        newChildren.push(transObjectName(item));
      });
      newCurRoute.children = newChildren;
    }
    return newCurRoute;
  };
  route.forEach((item) => {
    newRoute.push(transObjectName(item));
  });

  return newRoute;
}

/** 解析动态路由 */
function generateDynamicRoute(menuTabs: DynamicRouteType[], basePath: string) {
  return menuTabs.map<DynamicRouteMenu>((conf) => {
    // fullPath 可去掉*号，以免引起url路径错误
    // /*的配置只会在路由  路径的末尾...
    const resPath = resolvePath(
      conf.path ? _.replace(conf.path, conf.path === '*' ? '*' : '/*', '') : '/*',
      normalizePathname(basePath)
    );

    const menuDataItem: DynamicRouteMenu = {
      ...conf,
      access: conf.access,
      icon: getIcon(conf.icon),
      fullPath: resPath.pathname,
      element: conf.element
        ? getPage(conf.element, conf.access, resPath.pathname, conf.microApp)
        : getPage('Default')
    };

    if (conf.children) {
      menuDataItem.children = generateDynamicRoute(conf.children, resPath.pathname);
    }

    return menuDataItem;
  });
}

/**
 * @desc 解析路由（包括静态路由和动态路由）
 * 根据 @/config/routes.js 里的格式，解析出全局的路由。构造好路由结构。
 */
export function generateAllRoute(
  staticConf: StaticRouteType[],
  dynamicConf: DynamicRouteType[]
): {
  staticRoute: StaticRouteMenu[] | null;
  menuTabs: DynamicRouteMenu[] | null;
} {
  // 与prolayout 兼容的menuItem
  // name 用于配置在菜单中的名称，同时会修改为浏览器标签页标题
  // icon 代表菜单的体表，只 antd 的图表，iconfont 需要自己定义
  // locale 可以设置菜单名称的国际化表示
  // hideInMenu 会把这个路由配置在 menu 中隐藏这个路由，name 不填会有相同的效果
  // hideChildrenInMenu 会把这个路由的子节点在 menu 中隐藏

  if (!staticConf || !dynamicConf) return { staticRoute: null, menuTabs: null };

  let menuTabs: DynamicRouteType[] | null = null;
  /** 解析静态路由 */
  const generateStaticRoute = (config: StaticRouteType[], basePath: string) =>
    config.map<StaticRouteMenu>((conf) => {
      // fullPath 可去掉*号，以免引起url路径错误

      // const resPath = resolvePath(_.replace(conf.path,'/*',''),normalizePathname(basePath));
      const resPath = resolvePath(
        conf.path ? _.replace(conf.path, '/*', '') : '/*',
        normalizePathname(basePath)
      );

      const route: StaticRouteMenu = {
        // reactRouter 6 的 父子path 用来喂给react router6吃的1
        // 完整路径 parentPath:/a  childrenPath:b  fullPath:/a/b
        // fullPath 可去掉*号，以免引起url路径错误
        // 支持prolayout路由
        path: conf.path,
        element: conf.component
          ? getPage(conf.component, false, resPath.pathname)
          : getPage('Default')
      };

      if (conf.children) {
        route.children = generateStaticRoute(conf.children, resPath.pathname);
      } else {
        // 遇到menutabs 则 返回，将 静态和菜单的动态路由分开 ，有atom进行管理。
        if (!menuTabs && conf.menuTabs) {
          // 确保只添加一次。
          menuTabs = generateDynamicRoute(dynamicConf, '/');
          route.menuTabs = true;
        }
      }

      return route;
    });

  const staticRoute = generateStaticRoute(staticConf, '/');
  return { staticRoute, menuTabs };
}

// 路由拆分成了两部分，要把可变的部分 合并到新的整体中,并返回新的路由，配合react-router6的使用
// 以routeA 为基准，将routeB，拷贝至routeA里的object.menutabs=true标记的对象children属性下。使其成为一个可用的appRoute整体
export const mergeRoute = (
  routeA: StaticRouteType[],
  routeB: DynamicRouteType[],
  flag = 'menuTabs'
): StaticRouteType[] => {
  let newRoute = _.cloneDeep(routeA);
  const replaceFlagPropertyByChilren = (array: StaticRouteType[]) =>
    array.reduce((acc: StaticRouteType[], element) => {
      const item = {
        ...element,
        children: element[flag] ? routeB : element.children
      };

      if (!element[flag] && element.children) {
        item.children = replaceFlagPropertyByChilren(element.children);
      }

      acc.push(item);

      return acc;
    }, []);

  newRoute = replaceFlagPropertyByChilren(newRoute);
  return newRoute;
};

// /**
//  * @desc 接口返回的子应用路由结构适配 react-router6
//  *  子应用里的子路径的路径：绝对路径 -> 相对路径
//  * @param {AppRoute[] | null} applicationRoutes
//  * @param {string | null} parentPath 父路径
//  * @returns {AppRoute[] | null}
//  */
// export const transPathAdjustReactRouterFromRestful = (
//   applicationRoutes: AppRoute[] | null,
//   parentPath?: string | null
// ): AppRoute[] | null => {
//   if (!applicationRoutes) return applicationRoutes;
//   return applicationRoutes.map((appRoute: AppRoute) => ({
//     ...appRoute,
//     children: transPathAdjustReactRouterFromRestful(appRoute.children, appRoute.path),
//     path:
//       appRoute.path && !isUrl(appRoute.path)
//         ? appRoute.path.slice(1 + (parentPath ?? '').length)
//         : appRoute.path
//   }));
// };

/**
 * @desc 左侧菜单数据处理
 */
const getSiderMenuList = (
  menus: AppRoute[] | null,
  entry: string,
  parentPath?: string
): DynamicRouteType[] => {
  // 根据扩展字段进行菜单排序处理
  return [...(menus ?? [])]
    .sort((a, b) => {
      let { ext: aExt } = a;
      let { ext: bExt } = b;
      if (aExt && bExt) {
        try {
          aExt = JSON.parse(aExt);
          bExt = JSON.parse(bExt);
          return (aExt as any).index > (bExt as any).index ? 1 : -1;
        } catch (e) {
          return 0;
        }
      }
      return 0;
    })
    .reduce((acc, menu) => {
      const { children: routes, name, icon, hidden, path, applicationKey } = menu;
      /** 过滤掉欢迎页 && 过滤隐藏菜单 */
      if (path !== '/welcome' && !hidden) {
        acc.push({
          name,
          element: entry,
          icon: icon ?? 'AccountBookOutlined',
          microApp: applicationKey.toLowerCase(),
          children: getSiderMenuList(routes, entry, path),
          path: `${path && !isUrl(path) ? path.slice(1 + (parentPath ?? '').length) : path}/*`
        });
      }

      return acc;
    }, [] as DynamicRouteType[]);
};

/**
 * @desc Application => DynamicRouteType
 * @param {Application[]} apps
 */
export const getAppsMenu = (apps: Application[]): DynamicRouteType[] => {
  return apps.reduce((acc, item) => {
    const { key, name, routes, appType, isDel, logoUrl } = item;
    // 自建类型，并且未删除
    if (appType === 1 && !isDel && routes && ['ugc', 'oagw'].includes(key)) {
      acc.push({
        name,
        icon: logoUrl, // 不使用icon，使用url会通过img渲染，导致闪烁
        microApp: key.toLowerCase(),
        path: `${CUSTOM_NAV_PREFIX.slice(1)}/${key.toLowerCase()}/*`,
        entry: `${item.applicationUrl}/`,
        children: getSiderMenuList(routes, `${item.applicationUrl}/`)
      });
    }

    return acc;
  }, [] as DynamicRouteType[]);
};
