import React from 'react';

import SelectLang from '@/components/SelectLang';

import Avatar from './AvatarDropdown';
import styles from './index.less';

const GlobalHeaderRight: React.FC = () => {
  const className = `${styles.right}  ${styles.dark}`;

  return (
    <div className={className}>
      <Avatar />
      <SelectLang />
    </div>
  );
};

export default GlobalHeaderRight;
