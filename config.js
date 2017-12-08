'use strict';

exports.DATABASE_URL =
process.env.DATABASE_URL ||
global.DATABASE_URL ||
'mongodb://datenight:datenight@ds133746.mlab.com:33746/date-night';

exports.TEST_DATABASE_URL =
process.env.TEST_DATABASE_URL ||
global.TEST_DATABASE_URL ||
'mongodb://datenight:datenight@ds133746.mlab.com:33746/date-night';

exports.PORT = process.env.PORT || 8080;