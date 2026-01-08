const express = require('express');
const auth = require('../middleware/auth');
const calendarController = require('../controllers/calendarController');

const router = express.Router();

// Google Calendar linking
router.get('/google/status', auth, calendarController.getGoogleStatus);
router.get('/google/auth-url', auth, calendarController.getGoogleAuthUrl);
router.get('/google/callback', calendarController.handleGoogleCallback);
router.post('/google/disconnect', auth, calendarController.disconnectGoogleCalendar);

// Google Calendar events
router.get('/google/events', auth, calendarController.listGoogleEvents);
router.post('/google/events', auth, calendarController.createGoogleEvent);

module.exports = router;

