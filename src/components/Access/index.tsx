import _ from 'lodash';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import { accessAtom } from '@/atoms/access';

interface AccessProps {
  accessible: string;
  children: any;
  fallback?: any;
  redirectPath?: string;
}

const Access = function ({ children, accessible, redirectPath, fallback = null }: AccessProps) {
  const access = useRecoilValue(accessAtom);

  const childrenRender = typeof children === 'undefined' ? null : children;
  // access 和 accessible 不存在的情况
  if (!access || !accessible) {
    return { childrenRender };
  }

  if (_.isFunction(children)) {
    return <>{children(access[accessible])}</>;
  }

  const render = () => {
    if (access[accessible]) {
      return childrenRender;
    } else if (redirectPath) {
      return <Navigate /* from={window.location.href} */ to={redirectPath} />;
    } else {
      return fallback;
    }
  };

  return render();
};

export default Access;
