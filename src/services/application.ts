import type { Menu } from '@/atoms/menu';
import { ROOT_DOMAIN } from '@/config/base';
import { isUrl } from '@/utils/is';
import request from '@/utils/request';

enum AppType {
  SElF = 1,
  THIRD
}

/** @link https://jojoread.yuque.com/grvfq6/pk5arp/mi5frc?inner=OEYHu */
export interface AppRoute {
  applicationKey: string;
  authority: string;
  children: AppRoute[] | null;
  ext: string;
  haveData: boolean;
  hidden: boolean;
  icon: string;
  id: number;
  key: string;
  name: string;
  parentKey: string;
  path: string;
  type: string;
}

export interface Application {
  /** 管理员id */
  administratorId: number;
  /** 管理员名字 */
  administratorName: string;
  /** 应用类型 */
  appType: AppType;
  /** 应用类型描述 */
  appTypeDesc: string;
  /** 应用路径 */
  applicationUrl: string;
  /** 应用创建时间 */
  createTime: number;
  /** 应用描述 */
  desc: string;
  /** 应用id */
  id: number;
  /** 是否删除 */
  isDel: number;
  /** 应用key */
  key: string;
  /** ldap dn */
  ldapDn: string;
  /** ldap id */
  ldapId: number | null;
  /** 应用标志地址 */
  logoUrl: string;
  /** 应用名字 */
  name: string;
  /** 父 id */
  parentId: number | null;
  /** 菜单 */
  routes: AppRoute[] | null;
  /** 是否支持 vpn */
  supportVpn: boolean;
  /** 应用更新时间 */
  updateTime: number;
}

// 将数据缓存
let applicationUserAllData: Menu | null = null;

function debugLocal(data: any[]) {
  const temp = {
    // ticket: 'http://localhost:8006',
    ugc: 'http://localhost:8006'
    // luban: 'http://localhost:8005',
    // erp: 'http://localhost:8005',
    // 'jaguar-admin':'http://localhost:8005',
    // 'monitor-admin': 'http://localhost:8005',
    // message: 'http://localhost:8005',
    // 'jaguar-admin': 'http://localhost:8005',
    // drp: 'http://localhost:8004',
    // 'cc-admin': 'http://localhost:8003',
    // oagw: 'http://localhost:8002',
    // 'uc-web-server': 'http://localhost:8010',
    // sales: 'http://localhost:8888',
    // crm: 'http://localhost:8002',
    // mall: 'http://localhost:8002',
    // wind: 'http://localhost:8002',
    // 'bs-ds':'http://localhost:8002',
    // 'edu': 'http://localhost:8005',
    // marketing: 'http://localhost:8000',
  };

  return data.map((item: any): any => {
    const { key } = item;
    return { ...item, applicationUrl: `${temp[key.toLowerCase()] || ROOT_DOMAIN}/${key}` };
  });
}

const isVpn = /dingtalk.com$/.test(window.location.host);
const isDev = process.env.NODE_ENV === 'development';

const getUrl = (appKey: string, url: string) => {
  const fa = '/favicon.png';
  const uri = url || `/${appKey}${fa}`;
  const devUrl = !isUrl(url) ? `${ROOT_DOMAIN}${uri}` : uri;
  return isDev ? devUrl : uri;
};

/** 获取应用 */
export async function queryUserApplication(): Promise<any> {
  if (applicationUserAllData) return Promise.resolve(applicationUserAllData);

  return request('/application/user/all').then((res) => {
    if (!res || res.status !== 'OK')
      return {
        haveApplications: [],
        otherApplications: []
      };

    const { haveApplications, otherApplications } = res.data || {};
    // 处理应用域名问题
    // 在钉钉VPN环境过滤非接入VPN应用
    // * 如果是本地开发阶段，替换应用域名到对应环境地址
    const replaceAppUrl = isDev
      ? (haveApplications ?? []).map((item: any) => {
          const { key, logoUrl } = item;

          const nextLogoUrl = getUrl(key, logoUrl);

          return { ...item, logoUrl: nextLogoUrl };
        })
      : haveApplications;

    // * 如果是本地调试阶段，则替换线上域名到本域名
    const nextApps = process.env.ENV_DEBUG ? debugLocal(replaceAppUrl ?? []) : replaceAppUrl;

    // * 如果当前域名为钉钉VPN，过滤掉未接入VPN的应用，括三方应用(已授权与未授权应用)
    const final = [nextApps ?? [], otherApplications ?? []];
    const [hasApps, otherApps] = isVpn
      ? final.map((apps) => apps.filter((item: any) => item.supportVpn))
      : final;

    const data = { haveApplications: hasApps, otherApplications: otherApps };

    applicationUserAllData = data;
    return data;
  });
}
