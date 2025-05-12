const express = require('express');
const {
  createCashBooking,
  findAllBookings,
  findSpecificBooking,
  filterBookingForLoggedUser,
  updateBookingToPaid,
  updateBookingToDelivered,
  checkoutSession,
} = require('../services/bookingService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect);

router.get(
  '/',
  authService.allowedTo('user', 'admin', 'manager'),
  filterBookingForLoggedUser,
  findAllBookings
);
router.get('/:id', findSpecificBooking);

router.put(
  '/:id/pay',
  authService.allowedTo('admin', 'manager'),
  updateBookingToPaid
);
router.put(
  '/:id/deliver',
  authService.allowedTo('admin', 'manager'),
  updateBookingToDelivered
);

module.exports = router;
