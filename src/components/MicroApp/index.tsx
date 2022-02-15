import { useMount, useUnmount } from 'ahooks';
import type { MicroApp as MicroApp4Qiankun } from 'qiankun';
import { loadMicroApp } from 'qiankun';
import React, { useRef } from 'react';

import { CUSTOM_NAV_PREFIX, MICROAPP_CONTAINER_ID } from '@/config/base';

interface Props {
  entry: string;
  appKey: string;
  fullPath: string;
}

const MicroApp: React.FC<Props> = ({ entry, appKey, fullPath }) => {
  const container = useRef(null);
  const microApp = useRef<MicroApp4Qiankun | null>(null);

  useMount(() => {
    console.log('fullPath', fullPath);
    microApp.current = loadMicroApp(
      {
        entry,
        name: `${MICROAPP_CONTAINER_ID}${appKey}`,
        container: `#${MICROAPP_CONTAINER_ID}${appKey}`,
        props: {
          basePath: `${CUSTOM_NAV_PREFIX}/${appKey}`
        }
      },
      {
        sandbox: {
          // experimentalStyleIsolation: true,
          strictStyleIsolation: true
        },
        singular: false /* ,
        fetch(url, ...args) {
          return window.fetch(url, {
            ...args,
            mode: 'cors',
            credentials: 'include'
          });
        } */
      }
    );
  });

  useUnmount(() => {
    if ((microApp.current as MicroApp4Qiankun).getStatus() === 'MOUNTED') {
      return (microApp.current as MicroApp4Qiankun).unmount();
    }
    return 0;
  });

  return <div ref={container} id={`${MICROAPP_CONTAINER_ID}${appKey}`} />;
};

export default MicroApp;
