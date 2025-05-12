const eventRoute = require('./eventRoute');
const userRoute = require('./userRoute');
const authRoute = require('./authRoute');
const bookingRoute = require('./bookingRoute');

const mountRoutes = (app) => {
  app.use('/api/v1/events', eventRoute);
  app.use('/api/v1/users', userRoute);
  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/bookings', bookingRoute);
};

module.exports = mountRoutes;
