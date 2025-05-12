const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');

const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware');
const factory = require('./handlersFactory');
const Event = require('../models/eventModel');

exports.uploadEventImage = uploadSingleImage('image');

exports.resizeEventImages = asyncHandler(async (req, res, next) => {
  // console.log(req.files);
  //1- Image processing for imageCover
  if (req.file.fieldname === 'image') {
    
    const imageFileName = `event-${uuidv4()}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/events/${imageFileName}`);
    // Save image into our db
    req.body.image = imageFileName;
  }

  next();
});

// @desc    Get list of events
// @route   GET /api/v1/events
// @access  Public
exports.getEvents = factory.getAll(Event, 'Events');

// @desc    Get specific event by id
// @route   GET /api/v1/events/:id
// @access  Public
exports.getEvent = factory.getOne(Event);

// @desc    Create event
// @route   POST  /api/v1/events
// @access  Private
exports.createEvent = factory.createOne(Event);
// @desc    Update specific event
// @route   PUT /api/v1/events/:id
// @access  Private
exports.updateEvent = factory.updateOne(Event);

// @desc    Delete specific event
// @route   DELETE /api/v1/events/:id
// @access  Private
exports.deleteEvent = factory.deleteOne(Event);
