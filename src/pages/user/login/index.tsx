import { DesktopOutlined, MobileOutlined, QrcodeOutlined } from '@ant-design/icons';
import { i18n } from '@lingui/core';
import { useMount } from 'ahooks';
import { Alert, Col, Row } from 'antd';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import loginBg from '@/assets/login-bg.png';
import logo from '@/assets/logo-login.svg';

import LoginFrom from './components/Login';
import { useLogin } from './hooks';
import ScanQRCode from './ScanQRCode';
import { LoginParamsType } from './service';
import styles from './style.less';

const { Tab, UserName, Password, Mobile, Captcha, Submit } = LoginFrom;

const LoginMessage: React.FC<{ content: string }> = ({ content }) => (
  <Alert style={{ marginBottom: 24 }} message={content} type='error' showIcon />
);

const isPro = process.env.ENV_NAME === 'pro';

const loginTitle = {
  qrcode: {
    title: 'user-login.login.method.qrcode',
    titleStyle: { marginBottom: 0 },
    icon: <MobileOutlined />,
    type: 'mobile'
  },
  mobile: {
    title: 'user-login.login.method.mobile',
    titleStyle: { marginBottom: '1.5em' },
    icon: <QrcodeOutlined />,
    type: 'qrcode'
  },
  account: {
    title: 'user-login.login.method.account',
    titleStyle: { marginBottom: '1.5em' },
    icon: <QrcodeOutlined />,
    type: 'qrcode'
  }
};

const Login: React.FC = () => {
  const { status, type: loginType, login, loginLoading: submitting, authRedirect } = useLogin();
  const [type, setType] = useState<string>(loginType);

  const handleSubmit = (values: LoginParamsType) => {
    login({ ...values, type });
  };

  // 根据URL是否带有Token,验证是否登录
  useMount(() => authRedirect);

  const renderTab = (tabType: string) => {
    if (tabType === 'account' && isPro) return null;

    const tabHeader = loginTitle[tabType];
    return (
      <>
        <h3 style={tabHeader.titleStyle}>{i18n._(tabHeader.title)}</h3>
        <span className={styles.loginTypeBtn} onClick={() => setType(tabHeader.type)}>
          {tabHeader.icon}
        </span>
      </>
    );
  };

  return (
    <Row>
      <Col xs={24} sm={24} md={24} lg={14}>
        <div className={styles.loginBg}>
          <img src={loginBg} alt='login-bg' />
        </div>
      </Col>
      <Col xs={24} sm={24} md={24} lg={10}>
        <div className={styles.header}>
          <Link to='/'>
            <img alt='logo' className={styles.logo} src={logo} />
            <span className={styles.title} />
          </Link>
        </div>
        <div className={clsx([styles.main, styles.iconTab])}>
          <div className={styles.loginType}>{renderTab(type)}</div>

          <LoginFrom activeKey={type} onTabChange={setType} onSubmit={handleSubmit}>
            <Tab key='qrcode' tab={i18n._('user-login.login.tab-login-qrcode')}>
              {status === 'error' && loginType === 'qrcode' && (
                <LoginMessage
                  content={i18n._('user-login.login.message-invalid-verification-code')}
                />
              )}

              <ScanQRCode />
            </Tab>
            <Tab key='mobile' tab={i18n._('user-login.login.tab-login-mobile')}>
              {status === 'error' && loginType === 'mobile' && !submitting && (
                <LoginMessage
                  content={i18n._('user-login.login.message-invalid-verification-code')}
                />
              )}
              <Mobile
                name='mobile'
                placeholder={i18n._('user-login.phone-number.placeholder')}
                rules={[
                  {
                    required: true,
                    message: i18n._('user-login.phone-number.required')
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: i18n._('user-login.phone-number.wrong-format')
                  }
                ]}
              />
              <Captcha
                name='code'
                placeholder={i18n._('user-login.verification-code.placeholder')}
                countDown={60}
                getCaptchaButtonText={i18n._('user-login.form.get-captcha')}
                getCaptchaSecondText={i18n._('user-login.captcha.second')}
                rules={[
                  {
                    required: true,
                    message: i18n._('user-login.verification-code.required')
                  }
                ]}
              />
            </Tab>
            {!isPro ? (
              <Tab key='account' tab={i18n._('user-login.login.tab-login-credentials')}>
                {status === 'error' && loginType === 'account' && !submitting && (
                  <LoginMessage content={i18n._('user-login.login.message-invalid-credentials')} />
                )}

                <UserName
                  name='account'
                  placeholder={`${i18n._('user-login.login.userName')}（${i18n._(
                    'user-login.employee.account'
                  )}）`}
                  rules={[
                    {
                      required: true,
                      message: i18n._('user-login.userName.required')
                    }
                  ]}
                />
                <Password
                  name='password'
                  placeholder={`${i18n._('user-login.login.password')}`}
                  rules={[
                    {
                      required: true,
                      message: i18n._('user-login.password.required')
                    }
                  ]}
                />
              </Tab>
            ) : (
              <></>
            )}

            {/* <div>
          <Checkbox checked={autoLogin} onChange={e => setAutoLogin(e.target.checked)}>
            自动登录
          </Checkbox>
          <a style={{ float: 'right' }}>忘记密码 </a>
        </div> */}
            {type !== 'qrcode' ? (
              <Submit loading={submitting}>{i18n._('user-login.login.login')}</Submit>
            ) : (
              <></>
            )}

            {/* <div className={styles.other}>
          其他登录方式
          <AlipayCircleOutlined className={styles.icon} />
          <TaobaoCircleOutlined className={styles.icon} />
          <WeiboCircleOutlined className={styles.icon} />
          <Link className={styles.register} to="/user/register">
            注册账户
          </Link>
        </div> */}
          </LoginFrom>

          {!isPro && type !== 'account' ? (
            <span className={styles.loginDesktop} onClick={() => setType('account')}>
              <DesktopOutlined />
            </span>
          ) : null}
        </div>
      </Col>
    </Row>
  );
};

export default Login;
