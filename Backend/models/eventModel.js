const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
      minlength: [3, 'Event name must be at least 3 characters'],
      maxlength: [100, 'Event name must be less than 100 characters'],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      minlength: [20, 'Event description must be at least 20 characters'],
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
    },
    tags: [{ type: String }], // Optional: for filtering events
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
    },
    price: {
      type: Number,
      required: [true, 'Event price is required'],
      min: [0, 'Price cannot be negative'],
    },
    image: {
      type: String, // URL or path to image
      required: [true, 'Event image is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate for bookings (optional, to track bookings per event)
eventSchema.virtual('bookings', {
  ref: 'Booking',
  foreignField: 'event',
  localField: '_id',
});

// Set image URL
const setImageURL = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/events/${doc.image}`;
    doc.image = imageUrl;
  }
};

// Apply image URL transformation after save and init
eventSchema.post('init', setImageURL);
eventSchema.post('save', setImageURL);

module.exports = mongoose.model('Event', eventSchema);