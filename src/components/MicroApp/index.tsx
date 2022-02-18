import { useMount, useUnmount } from 'ahooks';
import type { MicroApp as MicroApp4Qiankun } from 'qiankun';
import { loadMicroApp } from 'qiankun';
import React, { useMemo, useRef } from 'react';

import { CUSTOM_NAV_PREFIX, MICROAPP_CONTAINER_ID } from '@/config/base';

interface Props {
  entry: string;
  appKey: string;
  fullPath: string;
}

const MicroApp: React.FC<Props> = ({ entry, appKey, fullPath }) => {
  const container = useRef(null);
  const microApp = useRef<MicroApp4Qiankun | null>(null);

  const fullPathToId = useMemo(
    () => (fullPath.slice(1) ?? '').replace(new RegExp('/', 'g'), '_'),
    [fullPath]
  );

  useMount(() => {
    if (!microApp.current) {
      microApp.current = loadMicroApp(
        {
          entry,
          name: `${MICROAPP_CONTAINER_ID}${appKey}`,
          container: `#${fullPathToId}`,
          props: {
            basePath: `${CUSTOM_NAV_PREFIX}/${appKey}`
          }
        },
        {
          sandbox: {
            /** vue scoped css 不支持增加类名前缀 暂时注释 */
            // experimentalStyleIsolation: true
            strictStyleIsolation: true
          },
          singular: false,
          // fetch(url, ...args) {
          //   console.log('MicroApp fetch', url);
          //   return window.fetch(url, {
          //     ...args,
          //     mode: 'cors',
          //     credentials: 'include'
          //   });
          // },
          getPublicPath: (e) => {
            console.log('getPublicPath', e);
            return e as string;
          }
        }
      );
    }
  });

  useUnmount(() => {
    if ((microApp.current as MicroApp4Qiankun)?.getStatus() === 'MOUNTED') {
      return (microApp.current as MicroApp4Qiankun)?.unmount();
    }
    return 0;
  });

  return <div id={fullPathToId} ref={container} data-id={`${MICROAPP_CONTAINER_ID}${appKey}`} />;
};

export default MicroApp;
