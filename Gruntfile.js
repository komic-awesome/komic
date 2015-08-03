var webpackConfig = require('./webpack.config.js')

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt)

  var contentBase = grunt.option('content-base') || './fixtures/ancient-egypt'

  grunt.initConfig({
    webpack: {
      options: webpackConfig
    , dist: { cache: false }
    }
  , 'webpack-dev-server': {
      options: {
        webpack: webpackConfig
      , contentBase: contentBase
      , publicPath: '/'
      , port: 8000
      , hot: true
      }
    , start: {
        keepalive: true
      , watch: true
      }
    }
  })

  grunt.registerTask('s'
    , '`grunt s` is alias task for `grunt webpack-dev-server`'
    , ['webpack-dev-server'])

}
