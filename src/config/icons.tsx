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
import { upperFirst } from 'lodash';
import memoized from 'nano-memoize';
import React from 'react';

import { isUrl } from '@/utils/is';

const svgStyle = {
  display: 'flex',
  fontSize: '18px',
  marginRight: '10px',
  alignItems: 'center',
  justifyContent: 'flex-start'
};

const imgStyle = {
  width: '18px',
  height: '40px',
  marginRight: '10px',
  backgroundSize: '100%',
  display: 'inline-block',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center center'
};

const icons = new Map([
  ['HomeOutlined', <HomeOutlined style={svgStyle} />],
  ['AppstoreOutlined', <AppstoreOutlined style={svgStyle} />],
  ['CompassOutlined', <CompassOutlined style={svgStyle} />],
  ['FormOutlined', <FormOutlined style={svgStyle} />],
  ['PieChartOutlined', <PieChartOutlined style={svgStyle} />],
  ['PaperClipOutlined', <PaperClipOutlined style={svgStyle} />],
  ['BarsOutlined', <BarsOutlined style={svgStyle} />],
  ['UserOutlined', <UserOutlined style={svgStyle} />]
]);

const getIcon = memoized((iconStr: string) => {
  if (isUrl(iconStr))
    return (
      <div
        style={{
          ...imgStyle,
          backgroundImage: `url(${iconStr})`
        }}
      />
    );
  else return icons.get(upperFirst(iconStr));
});

export default getIcon;
