const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// Getting the top 5 cheap best tours <-- alias
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};


// --------------------- Getting All Tours --------------------- 
exports.getAllTours = factory.getAll(Tour);

// --------------------- Getting Tour by ID --------------------- 
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// --------------------- Creating a new Tour --------------------- 
exports.createTour = factory.createOne(Tour);

// --------------------- Updating a Tour --------------------- 
exports.updateTour = factory.updateOne(Tour);

// --------------------- Deleting a tour --------------------- 
exports.deleteTour = factory.deleteOne(Tour);

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

exports.getToursWithin = catchAsync( async (req, res, next) => {
    const { distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');
    
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng) {
        next(new AppError("Please provide lattude and longitude in the format lag,lng", 400));
    }

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } } );

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }

    });
});

exports.getDistances = catchAsync( async (req, res, next) => {
    const { distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng) {
        next(new AppError("Please provide lattude and longitude in the format lag,lng", 400));
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }

    });
});