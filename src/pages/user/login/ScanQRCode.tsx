/**
 * 钉钉扫码登录
 * 参考文档： https://ding-doc.dingtalk.com/doc#/serverapi2/kymkv6
 */

import { LoadingOutlined } from '@ant-design/icons';
import { useMount, useRequest, useUnmount } from 'ahooks';
import { message, Spin } from 'antd';
import React, { useEffect, useState } from 'react';

import { queryDingConf } from './service';

// 钉钉登录网页内嵌地址
const dingQrCodeUrl = 'https://login.dingtalk.com/login/qrcode.htm';

// goto参数结构URL
const dingGoToUrl = 'https://oapi.dingtalk.com/connect/oauth2/sns_authorize';

const ScanQRCode: React.FC = () => {
  let timer: any;
  const [QCodeUrl, setQRCodeUrl] = useState<string>();
  const [dingAuthUrl, setDingAuthUrl] = useState<string>();

  const { loading, run: getDingConf } = useRequest(queryDingConf, {
    manual: true,
    onSuccess: ({ data }: any) => {
      if (data) {
        const { appId, redirectUrl, state } = data;
        if (!appId) {
          message.error('无appId!');
          return;
        }

        const goto = `${dingGoToUrl}?appid=${appId}&response_type=code&scope=snsapi_login&state=${state}&redirect_uri=${redirectUrl}`;
        const url = `${dingQrCodeUrl}?goto=${encodeURIComponent(goto)}&style=${encodeURIComponent(
          'border:none;font-size:20px;background-color:#fff;width:500px;'
        )}`;

        setDingAuthUrl(goto);
        setQRCodeUrl(url);
      }
    }
  });

  useMount(() => {
    // 获取钉钉配置信息, 每隔50秒重新获取二维码
    (function fn() {
      getDingConf({ redirectUrl: window.location.href });
      timer = setTimeout(fn, 50000);
    })();
  });

  useUnmount(() => clearTimeout(timer));

  const handleMessage = ({ origin, data }: { origin: string; data: string }): void => {
    if (origin === 'https://login.dingtalk.com') {
      const loginTmpCode = data;
      // 判断是否来自ddLogin扫码事件。
      if (!loginTmpCode) {
        // eslint-disable-next-line no-console
        console.log('on login tmp code');
      } else {
        const url = `${dingAuthUrl}&loginTmpCode=${loginTmpCode}`;
        window.location.href = url;
      }
    }
  };

  useEffect(() => {
    if (dingAuthUrl) window.addEventListener('message', handleMessage, false);
    return () => {
      window.removeEventListener('message', handleMessage, false);
    };
  }, [dingAuthUrl]);

  return (
    <div style={{ width: '320px', height: '320px', margin: '0 auto' }}>
      <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
        <iframe
          frameBorder={0}
          // allowTransparency={true}
          scrolling='no'
          title='企业钉钉扫码登录'
          style={{
            border: 'none',
            backgroundColor: '#FFFFFF',
            width: '320px',
            height: '320px'
          }}
          src={QCodeUrl}
        />
      </Spin>
    </div>
  );
};

export default ScanQRCode;
