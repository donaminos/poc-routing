const nextRoutes = require('next-routes')
const routes = module.exports = nextRoutes()
const vals = require('./routes.json');

vals.routeList.map((r, index) => {
  if(r.type === 'him') {
    // routes.add('him', r.seoUri)
    routes.add({name: index, pattern:  r.seoUri, page: 'him'})
  }
  else {
    routes.add({name: index, pattern:  r.seoUri, page: 'brand'})
    // routes.add('brand', r.seoUri)
  }
});
