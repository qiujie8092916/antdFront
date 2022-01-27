import { useMount, useUnmount } from 'ahooks';
import { customAlphabet } from 'nanoid';
import type { MicroApp } from 'qiankun';
import { loadMicroApp } from 'qiankun';
import { useRef } from 'react';
import React from 'react';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 10);

interface MicroAppProps {
  entry: string;
  fullPath: string;
}

export default function ({ entry, fullPath }: MicroAppProps) {
  const container = useRef(null);
  const containerID = useRef<string>(nanoid());
  const microApp = useRef<MicroApp | null>(null);

  useMount(() => {
    microApp.current = loadMicroApp(
      {
        name: `app${containerID.current}`,
        entry,
        // container: `#${id}`,
        props: {
          basePath: fullPath
        },
        container: `#${containerID.current}`
      },
      {
        sandbox: { strictStyleIsolation: true },
        singular: false
      }
    );
  });

  useUnmount(() => {
    if ((microApp.current as MicroApp).getStatus() === 'MOUNTED') {
      return (microApp.current as MicroApp).unmount();
    } else {
      return 0;
    }
  });

  // if (isUrl(entry)) { return (<NotFound />) }
  return <div ref={container} id={containerID.current} />;
}
