import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';
import { Button, Result } from 'antd';
import type { ResultStatusType } from 'antd/es/result';
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AccessResultProps {
  code: ResultStatusType;
}

const AccessResult = function ({ code }: AccessResultProps) {
  const navigate = useNavigate();

  return (
    <Result
      status={code}
      title={code}
      subTitle={i18n._(t`访问${code}`)}
      extra={
        <Button type='primary' onClick={() => navigate('/', { replace: true })}>
          {i18n._(t`返回首页`)}
        </Button>
      }
    />
  );
};

export default AccessResult;
