// babel.config.js

const DEBUG = true;
// This config is used by jest

module.exports = (api) => {
  if (api.env('test')) {
    api.cache(false);

    return {
      presets: [
        '@babel/preset-react',
        [
          '@babel/preset-env',
          {
            debug: DEBUG,
            targets: {
              node: 'current',
            },
          },
        ],
        '@babel/preset-typescript',
      ],
    };
  }

  let envOptions = { loose: true, debug: DEBUG, targets: { esmodules: true } };

  // browserslist is not configured when running integration tests
  if (api.env('integration')) {
    envOptions.targets = 'last 2 chrome version';
    return {
      presets: [
        '@babel/preset-react',
        ['@babel/preset-env', envOptions],
        '@babel/preset-typescript',
      ],
      plugins: [
        ['@babel/plugin-proposal-class-properties', { loose: true }],
        '@babel/plugin-proposal-optional-chaining',
      ],
    };
  }
};
