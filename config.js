exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                      'mongodb://dev:dev@ds231205.mlab.com:31205/mongoose-blog-api';
exports.PORT = process.env.PORT || 8080;

exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
global.TEST_DATABASE_URL ||
'mongodb://localhost/test-blog-app';
exports.PORT = process.env.PORT || 8080;