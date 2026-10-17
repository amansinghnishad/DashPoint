const library = require('./fileLibraryController');
const access = require('./fileAccessController');
const summary = require('./fileSummaryController');

module.exports = {
  ...library,
  ...access,
  ...summary
};
