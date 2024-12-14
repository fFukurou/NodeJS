const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// Getting the top 5 cheap best tours <-- alias
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};


// --------------------- Getting All Tours --------------------- 
exports.getAllTours = catchAsync( async (req, res, next) => {
        // EXECUTE QUERY
        const features = new APIFeatures(Tour.find(), req.query)
          .filter()
          .sort()
          .limitFields()
          .paginate();
        const tours = await features.query;

        // SEND RESPONSE
        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours: tours
            }
        });
});

// --------------------- Getting Tour by ID --------------------- 
exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tour: tour
        }
    });
});

// --------------------- Creating a new Tour --------------------- 



exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
});

// --------------------- Updating a Tour --------------------- 
exports.updateTour = catchAsync(async (req, res, next) => {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!tour) {
            return next(new AppError('No tour found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        });
});

// --------------------- Deleting a tour --------------------- 
exports.deleteTour = catchAsync(async (req, res, next) => {
        const tour = await Tour.findByIdAndDelete(req.params.id);

        if (!tour) {
            return next(new AppError('No tour found with that ID', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
});

// -------------------- Gettings STATISTICS of Tours (Data Analysis) --------------------- 
exports.getTourStats = catchAsync(async (req, res, next) => {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                }
            },  
            {
                $sort: { avgPrice: 1},
            },
            // {
            //     $match: { _id: { $ne: 'EASY'} }
            // }

        ]);

        res.status(200).json({
            status: 'success',
            data: {
                stats: stats
            }
        });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
        const year = Number(req.params.year); // e.g.: 2021

        const plan = await Tour.aggregate([
            {
                // Will separate/create new entries based on an array
                $unwind: '$startDates'
            },
            {
                $match: {
                    // Will filter the dates to be between the date specifcied (year)
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                // 'Group' basically only group and select certain criteria
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    // Adding back the name of each tour, grouped by month
                    tours: { $push: '$name'}
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                // Filters what fields we're gonna show
                $project: {
                    _id: 0
                }
            },
            {
                // Orders fields by variable
                $sort: { numTourStarts: -1 }
            },
            {
                $limit: 12
            }

        ]);

        res.status(200).json({
            status: 'success',
            results: plan.length,
            data: {
                plan: plan
            }
        });
});