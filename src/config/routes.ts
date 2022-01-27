// import { i18n } from "@lingui/core";
// import { t } from "@lingui/macro";
// name 省略 则 name = component
// component 无 page 说明只是个路径，无需对应组件
// function routeConfig() {
// 纯json的配置，主要为了在无框架条件下 实现 json 路由配置的动态修改
// react-router6 支持index route 和 prolayout route ,caseSensitive 配置 与 Muti app 的 basePath 写法。
import type { RouteObject } from 'react-router-dom'

export interface MenuTabType {
  path?: string;
  /** index route写法 */
  index?: boolean;
  /** 翻译失败后 则采用name配置值,如无需全球化直接使用中文即可 */
  name: string;
  /** @/config/icons里配置的图标,小写也可以 */
  icon?: string;
  /** @/config/access里可配置静态策略。权限入口在@/config/pages里 */
  access?: string;
  /** 非动态的有page属性的路由，会默认显示在sideMmenu里 */
  component?: string;
  children?: MenuTabType[];
}

export interface RouteType<T> extends RouteObject {
  /** 组件或页面 */
  component: string;
  children?: RouteType<T>[];
  menuTabs?: T;
}

const routes: RouteType<MenuTabType[]>[] = [
  {
    // path:'/',
    component: 'blankLayout',
    children: [
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
                component: 'dashboard' // 非动态的有page属性的路由，会默认显示在sideMmenu里。
              },
              {
                name: '微前端',
                path: '/micro',
                icon: 'PaperClipOutlined',
                children: [
                  // {
                  //   name: "material-ui",
                  //   path: "material/*",
                  //   access: "microOpen",
                  //   component: "http://localhost:8002" // 微前端配置
                  // },
                  {
                    name: 'vue2测试',
                    path: 'vue2/*',
                    access: 'microOpen',
                    component: 'http://localhost:7101' // 微前端配置
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export default routes;
