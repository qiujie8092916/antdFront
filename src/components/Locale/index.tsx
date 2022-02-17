// import { Suspense } from "react";
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
// import PageLoading from "@/components/PageLoading";
import { useMount } from 'ahooks';
import { ConfigProvider } from 'antd';
import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { antdLocaleAtom, curLangAtom, locales } from '@/atoms/locale';

// import zh from "@/locales/zh-CN"; // 默认加载中文。 lingui-detect尚不稳定

const Locale: React.FC<{ children: any }> = ({ children }) => {
  const curLang = useRecoilValue(curLangAtom);
  const antdLocale = useRecoilValue(antdLocaleAtom);

  useMount(() => {
    /** 初始化多语言：加载复数、加载翻译 */
    Object.keys(locales).forEach(async (lang) => {
      const locale = locales[lang];
      const { default: messages } = await import(`@/locales/${lang}.js`);

      i18n.loadLocaleData(lang, { plurals: locale.plural });
      i18n.load(lang, messages);
    });
    // const { messages } = await import(`@/locales/${lang}.js`);
    // i18n.load(lang, messages);
    // i18n.activate(lang);
  });

  useEffect(() => {
    i18n.activate(curLang);
  }, [curLang]);

  return (
    <I18nProvider i18n={i18n}>
      <ConfigProvider locale={antdLocale}>{children}</ConfigProvider>
    </I18nProvider>
  );
};

export default Locale;
