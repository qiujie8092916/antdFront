module.exports = {
  extends: [
    require.resolve('@woulsl/fabric/eslint-config-mfe/eslintrc.react.js'),
    require.resolve('@woulsl/fabric/eslint-config-mfe/eslintrc.typescript-react.js')
  ],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    ENV_NAME: true
  }
};
