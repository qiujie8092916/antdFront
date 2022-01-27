import classNames from 'classnames';
import React from 'react';

import styles from './index.less';

type LinkType = {
  key: string;
  blankTarget?: boolean;
  href: string;
  title: string;
};

interface GlobalFooterProps {
  className?: any;
  links?: LinkType[];
  copyRight?: React.ReactElement;
}

export default function ({ className, links, copyRight }: GlobalFooterProps) {
  const clsString = classNames(styles.globalFooter, className);
  return (
    <div className={clsString}>
      {links && (
        <div className={styles.links}>
          {links.map((link) => (
            <a
              key={link.key}
              target={link.blankTarget ? '_blank' : '_self'}
              href={link.href}
              rel='noreferrer'>
              {link.title}
            </a>
          ))}
        </div>
      )}
      {copyRight && <div className={styles.copyRight}>{copyRight}</div>}
    </div>
  );
}
