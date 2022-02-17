// import { i18n } from "@lingui/core";
// import { t } from "@lingui/macro";
// name 省略 则 name = component
// component 无 page 说明只是个路径，无需对应组件
// function routeConfig() {
// 纯json的配置，主要为了在无框架条件下 实现 json 路由配置的动态修改
// react-router6 支持index route 和 prolayout route ,caseSensitive 配置 与 Muti app 的 basePath 写法。
import { MenuDataItem } from '@ant-design/pro-layout';
import type { RouteObject } from 'react-router-dom';

// import { CUSTOM_NAV_PREFIX } from '@/config/base';

// 理解下来 menuTabs 里包裹的是动态路由（sideMenuBar的路由）
// 静态路由则是死路由 比如用户信息页、登录页等等，且将 menuTabs 置为 true，切断了下面的动态路由

export interface StaticRouteType extends RouteObject, MenuDataItem {
  children?: StaticRouteType[];
  menuTabs?: boolean;
}

export interface DynamicRouteType extends RouteObject, MenuDataItem {
  /** 菜单栏名称 */
  name: string;
  /** 图标 顶层菜单会有图标显示 子菜单没有图标显示 @/config/icons里配置的图标,小写也可以，支持http网络图片 */
  icon?: string;
  /** 权限 @/config/access里可配置静态策略。权限入口在@/config/pages里 */
  access?: string;
  /** 顶层菜单会有 应用真实访问路径（和以下 element 相同，element 最终会转为 React.ReactElement, entry 则会继续保留原始入口） */
  entry?: string;
  /** 最里层菜单会有 应用入口组件 非动态的有page属性的路由，会默认显示在sideMmenu里 微前端为子应用入口 */
  element?: string;
  /** 子应用 key */
  microApp?: string;
  /** 最里层菜单会有 完整路径 parentPath:/a  childrenPath:b  fullPath:/a/b */
  fullPath?: string;
  /** 子路由 */
  children?: DynamicRouteType[];
}

interface BaseRouteType extends RouteObject {
  component: string;
}

/** 👇🏻路由配置的接口类型 */
export interface RouteType extends BaseRouteType {
  children?: RouteType[];
  menuTabs?: DynamicRouteType[];
}

const routes: RouteType[] = [
  {
    path: '/user',
    component: 'userLayout',
    children: [
      {
        path: 'register',
        component: 'userRegister'
      },
      {
        path: 'login',
        component: 'userLogin'
      }
    ]
  },
  {
    // path: '/',  // prolayout route写法
    component: 'securityLayout',
    children: [
      {
        // path: "/", // prolayout route写法
        component: 'basicLayout',
        // access:'validUser',
        // 之所以用menuTabs 为了将功能单独做成动态的route
        menuTabs: [
          {
            path: '/',
            index: true, // index route写法
            name: '欢迎菜单', // 翻译失败后 则采用name配置值,如无需全球化直接使用中文即可。
            icon: 'HomeOutlined', // @/config/icons里配置的图标,小写也可以
            access: 'dashboardOpen', // @/config/access里可配置静态策略。权限入口在@/config/pages里。
            element: 'dashboard' // 非动态的有page属性的路由，会默认显示在sideMmenu里。
          },
          {
            name: '微前端',
            microApp: 'vue2',
            path: `micro/vue2/*`,
            icon: 'PaperClipOutlined',
            entry: 'http://localhost:7101/vue2/', // 喂给 registerMicroApps
            children: [
              {
                microApp: 'vue2',
                name: 'vue2测试',
                path: '*',
                // access: 'microOpen',
                element: 'http://localhost:7101/vue2/' // 微前端配置
              },

              {
                microApp: 'vue2',
                name: 'vue2 about',
                path: 'about/*',
                // access: 'microOpen',
                element: 'http://localhost:7101/vue2/' // 微前端配置
              }
            ]
          }
        ]
      }
    ]
  }
];

export default routes;
