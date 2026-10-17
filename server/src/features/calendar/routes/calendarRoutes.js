const express = require('express');
const auth = require('../../../middleware/auth');
const calendarController = require('../controllers/calendarController');
const {
  freeBusyValidation,
  scheduleValidation
} = require('../middleware/calendarValidators');

const router = express.Router();

// Google Calendar linking
router.get('/google/status', auth, calendarController.getGoogleStatus);
router.get('/google/auth-url', auth, calendarController.getGoogleAuthUrl);
router.get('/google/callback', calendarController.handleGoogleCallback);
router.post('/google/disconnect', auth, calendarController.disconnectGoogleCalendar);

// Google Calendar events
router.get('/google/events', auth, calendarController.listGoogleEvents);
router.post('/google/events', auth, calendarController.createGoogleEvent);
router.delete('/google/events/:eventId', auth, calendarController.deleteGoogleEvent);

// Free/busy + scheduling
router.post(
  '/google/freebusy',
  auth,
  freeBusyValidation,
  calendarController.queryGoogleFreeBusy
);

router.post(
  '/google/schedule',
  auth,
  scheduleValidation,
  calendarController.scheduleGoogleBlock
);

module.exports = router;
