import {
  AppstoreOutlined,
  BarsOutlined,
  CompassOutlined,
  FormOutlined,
  HomeOutlined,
  PaperClipOutlined,
  PieChartOutlined,
  UserOutlined
} from '@ant-design/icons';
import _ from 'lodash';
import memoized from 'nano-memoize';
import React from 'react';

import { isUrl } from '@/utils/is';
// 需要 引入 react jsx parser么？ 好像有点大。就这几个图标，还是 用函数代替吧。

const icons = new Map([
  ['HomeOutlined', <HomeOutlined />],
  ['AppstoreOutlined', <AppstoreOutlined />],
  ['CompassOutlined', <CompassOutlined />],
  ['FormOutlined', <FormOutlined />],
  ['PieChartOutlined', <PieChartOutlined />],
  ['PaperClipOutlined', <PaperClipOutlined />],
  ['BarsOutlined', <BarsOutlined />],
  ['UserOutlined', <UserOutlined />]
]);

const getIcon = memoized((_iconStr: string) => {
  if (isUrl(_iconStr)) {
    return (
      <img
        alt={'icon'}
        src={_iconStr}
        style={{
          height: 32,
          width: 32
        }}
      />
    );
  }
  const iconStr = _.upperFirst(_iconStr);
  return <>{icons.get(iconStr)}</>;
});

export default getIcon;
