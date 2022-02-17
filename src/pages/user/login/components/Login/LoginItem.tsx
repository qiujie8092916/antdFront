import { i18n } from '@lingui/core';
import { Button, Col, Form, Input, message, Row } from 'antd';
import { FormItemProps } from 'antd/es/form/FormItem';
import omit from 'omit.js';
import React, { useCallback, useEffect, useState } from 'react';

import { getFakeCaptcha } from '../../service';
import styles from './index.less';
import LoginContext, { LoginContextProps } from './LoginContext';
import ItemMap from './map';

export type WrappedLoginItemProps = LoginItemProps;
export type LoginItemKeyType = keyof typeof ItemMap;
export interface LoginItemType {
  UserName: React.FC<WrappedLoginItemProps>;
  Password: React.FC<WrappedLoginItemProps>;
  Mobile: React.FC<WrappedLoginItemProps>;
  Captcha: React.FC<WrappedLoginItemProps>;
}

export interface LoginItemProps extends Partial<FormItemProps> {
  name?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  buttonText?: React.ReactNode;
  countDown?: number;
  getCaptchaButtonText?: string;
  getCaptchaSecondText?: string;
  type?: string;
  defaultValue?: string;
  customProps?: Record<string, unknown>;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tabUtil?: LoginContextProps['tabUtil'];
}

const FormItem = Form.Item;

const getFormItemOptions = ({
  onChange,
  defaultValue,
  customProps = {},
  rules
}: LoginItemProps) => {
  const options: {
    rules?: LoginItemProps['rules'];
    onChange?: LoginItemProps['onChange'];
    initialValue?: LoginItemProps['defaultValue'];
  } = {
    rules: rules || (customProps.rules as LoginItemProps['rules'])
  };
  if (onChange) {
    options.onChange = onChange;
  }
  if (defaultValue) {
    options.initialValue = defaultValue;
  }
  return options;
};

const LoginItem: React.FC<LoginItemProps> = (props) => {
  const [count, setCount] = useState<number>(props.countDown || 0);
  const [timing, setTiming] = useState(false);
  // 这么写是为了防止restProps中 带入 onChange, defaultValue, rules props tabUtil
  const {
    onChange,
    customProps,
    defaultValue,
    rules,
    name,
    getCaptchaButtonText,
    getCaptchaSecondText,
    type,
    tabUtil,
    ...restProps
  } = props;

  const onGetCaptcha = useCallback(async (values: { mobile: string }) => {
    const result = await getFakeCaptcha(values);
    if (result.status !== 'OK') {
      if (result.errorCode === '0033') {
        // 验证码已发送
        setTiming(true);
      }
      return;
    }
    message.success('获取验证码成功！请查看手机');
    setTiming(true);
  }, []);

  useEffect(() => {
    let interval: number = 0;
    const { countDown } = props;
    if (timing) {
      interval = window.setInterval(() => {
        setCount((preSecond) => {
          if (preSecond <= 1) {
            setTiming(false);
            clearInterval(interval);
            // 重置秒数
            return countDown || 60;
          }
          return preSecond - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timing]);
  if (!name) {
    return null;
  }
  // get getFieldDecorator props
  const options = getFormItemOptions(props);
  const otherProps = restProps || {};

  if (type === 'Captcha') {
    const inputProps = omit(otherProps, ['countDown']);

    return (
      <FormItem shouldUpdate noStyle>
        {({ validateFields }) => (
          <Row gutter={8}>
            <Col span={15}>
              <FormItem name={name} {...options}>
                <Input {...customProps} {...inputProps} />
              </FormItem>
            </Col>
            <Col span={9}>
              <Button
                disabled={timing}
                className={styles.getCaptcha}
                size='large'
                onClick={() => {
                  validateFields(['mobile']).then(({ mobile }) => onGetCaptcha({ mobile }));
                }}>
                {timing
                  ? `${count} ${i18n._('user-login.captcha.second')}`
                  : i18n._('user-login.register.get-verification-code')}
              </Button>
            </Col>
          </Row>
        )}
      </FormItem>
    );
  }
  return (
    <FormItem name={name} {...options}>
      <Input {...customProps} {...otherProps} />
    </FormItem>
  );
};

const LoginItems: Partial<LoginItemType> = {};

Object.keys(ItemMap).forEach((key) => {
  const item = ItemMap[key];
  LoginItems[key] = (props: LoginItemProps) => (
    <LoginContext.Consumer>
      {(context) => (
        <LoginItem customProps={item.props} rules={item.rules} {...props} type={key} {...context} />
      )}
    </LoginContext.Consumer>
  );
});

export default LoginItems as LoginItemType;
