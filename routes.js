const routes = require('next-routes')();
routes
.add('/icos/new', '/icos/new')
.add('/icos/:address', '/icos/show')
.add('/icos/:address/admin', '/icos/admin');

module.exports = routes;
