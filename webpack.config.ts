import CopyWebpackPlugin from 'copy-webpack-plugin';
import type { Configuration } from 'webpack';
import { merge } from 'webpack-merge';

import grafanaConfig, { type Env } from './.config/webpack/webpack.config';

const config = async (env: Env): Promise<Configuration> => {
  const baseConfig = await grafanaConfig(env);

  return merge(baseConfig, {
    // The scaffold externalizes only 'react-dom'. With React 19, 'react-dom/client' is a full renderer,
    // not a re-export, so @rc-component/util would bundle a second copy. Grafana shares both since 13.0.
    externals: ['react-dom/client', 'react-dom/server'],
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'img',
            to: 'img',
          },
        ],
      }),
    ],
  });
};

export default config;
