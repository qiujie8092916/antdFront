import { Button, Form } from 'antd';
import { ButtonProps } from 'antd/es/button';
import clsx from 'clsx';
import React from 'react';

import styles from './index.less';

const FormItem = Form.Item;

interface LoginSubmitProps extends ButtonProps {
  className?: string;
}

const LoginSubmit: React.FC<LoginSubmitProps> = ({ className, ...rest }) => {
  const clsString = clsx(styles.submit, className);
  return (
    <FormItem>
      <Button size='large' className={clsString} type='primary' htmlType='submit' {...rest} />
    </FormItem>
  );
};

export default LoginSubmit;
