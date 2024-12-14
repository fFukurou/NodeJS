// File to configure the express application

const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

// Global Middlewares
// --------------------- Set security HTTP headers --------------------- 
app.use(helmet());

// --------------------- SDevelopment Logging --------------------- 
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// --------------------- Limit requests from same API --------------------- 
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, pelase try again in an hour...'
});

app.use('/api', limiter);

// --------------------- Body parser, reading data from body into req.body --------------------- 
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against noSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp( {
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price']
}));

// Will load a static file if entered on the browser
app.use(express.static(`${__dirname}/public`));

// --------------------- Test Middleware --------------------- 
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// --------------------- Routing --------------------- 
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Creating an error in case the endpoint is not valid
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server...`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

