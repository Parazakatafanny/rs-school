const path = require('path');

const target =  'http://localhost:8080';

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
      publicPath: '/',
    },
};
