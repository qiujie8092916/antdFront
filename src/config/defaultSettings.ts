import { Settings as ProSettings } from '@ant-design/pro-layout';

type DefaultSettings = ProSettings & {
  pwa: boolean;
};

const proSettings: DefaultSettings = {
  navTheme: 'dark',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'side',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true, //
  colorWeak: false,
  menu: {
    locale: true
  },
  title: '叫叫工作台',
  pwa: false,
  iconfontUrl: ''
};

export default proSettings;
