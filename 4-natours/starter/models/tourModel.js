const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "A tour must have a name."],
        unique: true,
        maxlength: [40, 'A tour name must have less or equal than 40 characters.'],
        minlength: [10, 'A tour name must have at least 10 characters.'],
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,

    duration: {
        type: Number,
        required: [true, "A tour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, "A tour must have a group size"]
    },
    difficulty: {
        type: String,
        required: [true, "A tour must have a difficulty"],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium or difficult',
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Raing must be 1.0 or above'],
        max: [5, 'Raing must be 5.0 or below'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, "A tour must have a price"]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(value) {
                // 'this' only points to current doc on NEW document creation
                return value < this.price; // 100 < 200 true ... otherwise false!
            },
            message: 'Discount price ({VALUE}) should be below regular price...'
        }
    },

    summary: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        required: [true, "A tour must have a description"]
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // GeoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
 {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// tourSchema.index({price: 1})
tourSchema.index({price: 1, ratingsAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({ startLocation: '2dsphere'});

// A -->VIRTUAL<-- Property will be created each time we query for a document
// It is not persistent in the database
// It is a business logic, because getting the duration in weeks has nothing to do with actually implementing the database, routes, controllers, etc...
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Virtual Populate
tourSchema.virtual('reviews', {
    ref: 'Review', 
    foreignField: 'tour',
    localField: '_id'
});

// --------------------- Mongoose DOCUMENT MIDDLEWARE --------------------- 
// PRE-Document Middleware: runs before .save() and .create()
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();

});

// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);

//     next();
// });

// tourSchema.pre('save', function(next){
//     console.log("Will save document...");
//     next();
// })

// // POST-Document Middleware: executed after all middleware functions have completed
// tourSchema.post('save', function(doc, next) {
//     console.log(doc);
//     next();
// });

// --------------------- Mongoose QUERY MIDDLEWARE --------------------- 
//            This regular expression basically means 'all the strings that start with find
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true} });

    this.start = Date.now();
    next();

});

tourSchema.pre(/^find/, function(next) {
    this.populate( {
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });

    next();
});


tourSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
});



// --------------------- Mongoose AGGREGATION MIDDLEWARE --------------------- 
// tourSchema.pre('aggregate', function(next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//     console.log(this.pipeline());
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;