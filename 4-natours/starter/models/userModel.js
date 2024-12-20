const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name!"]   
    },
    email: {
        type: String,
        required: [true, 'Please provide your email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email...']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        // 'select' makes it so the password doesn't show when reading from DB
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            // This only works on CREATE and SAVE! 
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same...'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// PRE-SAVE Middleware to encrypt password
userSchema.pre('save', async function(next) {
    // If the password has not been modified, do nothing and go to the next middleware
    if (!this.isModified('password')) return next();
    // Otherwise, let's encrypt it/hash it with the cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirmed field
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    // this points to a current query
    this.find({active: {$ne: false}});
    next();
});

// Instance method --> available on all documents of a certain collection
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256')
      .update(resetToken)
      .digest('hex');

      this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    console.log( {resetToken }, this.passwordResetToken);
    return resetToken;
}


const User = mongoose.model('User', userSchema);

module.exports = User;