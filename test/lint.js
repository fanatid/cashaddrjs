/**
 * https://github.com/bitcoincashjs/cashaddr
 * Copyright (c) 2017-2018 Emilio Almansi
 * Distributed under the MIT software license, see the accompanying
 * file LICENSE or http://www.opensource.org/licenses/mit-license.php.
 */

const lint = require('mocha-eslint');

const paths = [
  'src/**/*.js',
  'test/**/*.js',
];

const options = {
  formatter: 'compact',
  alwaysWarn: false,
  timeout: 5000,
  slow: 1000,
  strict: true,
  contextName: 'eslint',
};

lint(paths, options);
