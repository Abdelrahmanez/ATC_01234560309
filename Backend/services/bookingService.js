const stripe = require('stripe')(process.env.STRIPE_SECRET);
const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const ApiError = require('../utils/apiError');

const User = require('../models/userModel');
const Event = require('../models/eventModel');
const Booking = require('../models/bookingModel');

// @desc    create cash booking
// @route   POST /api/v1/bookings/cartId
// @access  Protected/User
exports.createCashBooking = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
    );
  }

  // 2) Get booking price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalBookingPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create booking with default paymentMethodType cash
  const booking = await Booking.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalBookingPrice,
  });

  // 4) After creating booking, decrement event quantity, increment event sold
  if (booking) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.event },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Event.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: 'success', data: booking });
});

exports.filterBookingForLoggedUser = asyncHandler(async (req, res, next) => {
  if (req.user.role === 'user') req.filterObj = { user: req.user._id };
  next();
});
// @desc    Get all bookings
// @route   POST /api/v1/bookings
// @access  Protected/User-Admin-Manager
exports.findAllBookings = factory.getAll(Booking);

// @desc    Get all bookings
// @route   POST /api/v1/bookings
// @access  Protected/User-Admin-Manager
exports.findSpecificBooking = factory.getOne(Booking);

// @desc    Update booking paid status to paid
// @route   PUT /api/v1/bookings/:id/pay
// @access  Protected/Admin-Manager
exports.updateBookingToPaid = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return next(
      new ApiError(
        `There is no such a booking with this id:${req.params.id}`,
        404
      )
    );
  }

  // update booking to paid
  booking.isPaid = true;
  booking.paidAt = Date.now();

  const updatedBooking = await booking.save();

  res.status(200).json({ status: 'success', data: updatedBooking });
});

// @desc    Update booking delivered status
// @route   PUT /api/v1/bookings/:id/deliver
// @access  Protected/Admin-Manager
exports.updateBookingToDelivered = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return next(
      new ApiError(
        `There is no such a booking with this id:${req.params.id}`,
        404
      )
    );
  }

  // update booking to paid
  booking.isDelivered = true;
  booking.deliveredAt = Date.now();

  const updatedBooking = await booking.save();

  res.status(200).json({ status: 'success', data: updatedBooking });
});

// @desc    Get checkout session from stripe and send it as response
// @route   GET /api/v1/bookings/checkout-session/cartId
// @access  Protected/User
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
    );
  }

  // 2) Get booking price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalBookingPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        name: req.user.name,
        amount: totalBookingPrice * 100,
        currency: 'egp',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/bookings`,
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send session to response
  res.status(200).json({ status: 'success', session });
});

const createCardBooking = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const oderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // 3) Create booking with default paymentMethodType card
  const booking = await Booking.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalBookingPrice: oderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: 'card',
  });

  // 4) After creating booking, decrement event quantity, increment event sold
  if (booking) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.event },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Event.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
};

// @desc    This webhook will run when stripe payment success paid
// @route   POST /webhook-checkout
// @access  Protected/User
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    //  Create booking
    createCardBooking(event.data.object);
  }

  res.status(200).json({ received: true });
});
