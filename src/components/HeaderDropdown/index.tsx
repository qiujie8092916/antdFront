import { Dropdown } from 'antd';
import classNames from 'classnames';
import React from 'react';

import styles from './index.less';

interface HeaderDropdownProp {
  overlayClassName?: string;
  overlay: React.ReactElement;
  [p: string]: any;
}

const HeaderDropdown = function ({
  overlayClassName: cls,
  overlay,
  ...restProps
}: HeaderDropdownProp) {
  return (
    <Dropdown
      overlayClassName={classNames(styles.container, cls)}
      overlay={overlay}
      {...restProps}
    />
  );
};

export default HeaderDropdown;
