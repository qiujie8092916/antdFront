import { en, zh } from 'make-plural/plurals';
import { atom, selector } from 'recoil';

export const locales = {
  'zh-CN': {
    name: '简体中文',
    icon: '🇨🇳',
    // UILocale:zhCN
    // antd:zhCN
    plural: zh,
    antd: {
      ...require('antd/es/locale/zh_CN').default
    }
  },
  'en-US': {
    name: '英文',
    icon: '🇺🇸',
    // UILocale:enUS
    // antd:enUS
    plural: en,
    antd: {
      ...require('antd/es/locale/en_US').default
    }
  }
};

export const curLangAtom = atom({
  key: 'curLangAtom',
  default: 'zh-CN'
});

// UI 国际化内容
// UI 内容随curLangAtom 而改变，故为selector

export const antdLocaleAtom = selector({
  key: 'antdLocaleAtom',
  get: ({ get }) => locales[get(curLangAtom)].antd
});
