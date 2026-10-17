const connection = require('./calendarConnectionController');
const events = require('./calendarEventsController');
const scheduling = require('./calendarSchedulingController');

module.exports = {
  ...connection,
  ...events,
  ...scheduling
};
