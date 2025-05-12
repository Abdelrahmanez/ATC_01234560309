const express = require('express');
const {
  getEventValidator,
  createEventValidator,
  updateEventValidator,
  deleteEventValidator,
} = require('../utils/validators/eventValidator');

const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
  resizeEventImages,
} = require('../services/eventService');
const authService = require('../services/authService');

const router = express.Router();

// POST   /events/jkshjhsdjh2332n/reviews
// GET    /events/jkshjhsdjh2332n/reviews
// GET    /events/jkshjhsdjh2332n/reviews/87487sfww3

router
  .route('/')
  .get(getEvents)
  .post(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    uploadEventImage,
    resizeEventImages,
    createEventValidator,
    createEvent
  );
router
  .route('/:id')
  .get(getEventValidator, getEvent)
  .put(
    authService.protect,
    authService.allowedTo('admin', 'manager'),
    updateEventValidator,
    updateEvent
  )
  .delete(
    authService.protect,
    authService.allowedTo('admin'),
    deleteEventValidator,
    deleteEvent
  );

module.exports = router;
