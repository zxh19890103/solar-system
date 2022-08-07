const path =  require('path')

module.exports = {
  resolve: {
    'react': 'react/umd/react.development.js',
    'react-dom': 'react-dom/umd/react-dom.development.js'
  },
  watch: [
    path.join(__dirname, './warehouse')
  ]
}
