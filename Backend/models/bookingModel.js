const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Booking must belong to an event'],
    },
    bookedAt: {
      type: Date,
      default: Date.now,
    },
    quantity: {
      type: Number,
      default: 0 ,
    },
  },
  { timestamps: true }
);

// Populate user and event details in queries
bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'email',
  }).populate({
    path: 'event',
    select: 'name image date venue price',
  });
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);