import { DefaultFooter } from '@ant-design/pro-layout';
import { i18n } from '@lingui/core';
import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

import SelectLang from '@/components/SelectLang';
import proSettings from '@/config/defaultSettings';

import styles from './UserLayout.less';

const UserLayout: React.FC = () => {
  const title = `${i18n._('user-login.login.login')} - ${proSettings.title}`;

  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name='description' content={title} />
      </Helmet>

      <div className={styles.container}>
        <div className={styles.lang}>
          <SelectLang />
        </div>
        <div className={styles.content}>
          <Outlet />
        </div>
        <DefaultFooter copyright='2020 成都书声科技有限公司' links={false} />
      </div>
    </HelmetProvider>
  );
};

export default UserLayout;
