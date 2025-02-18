const resolve = require('path').resolve
const { pwaMetaTags, manifestMetaTags } = require('./meta.config')

module.exports = {
  pwa: {
    icon: {
      fileName: resolve(__dirname, './client/static/helix-favicon.png'),
      source: resolve(__dirname, './client/static/helix-favicon.png')
    },

    meta: {
      favicon: true,
      ...pwaMetaTags
    },

    manifest: {
      ...manifestMetaTags
    }
  }
}
