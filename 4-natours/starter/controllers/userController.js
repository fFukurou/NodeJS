// --------------------- Getting Users --------------------- 
exports.getAllUsers = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

// --------------------- Checking ID Validity -------------------
exports.checkID = (req, res, next, value) => {
    console.log(`User ID is: ${value}`);
    next();
};
// --------------------- Getting User by ID --------------------- 
exports. getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

// --------------------- Creating an User --------------------- 
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

// --------------------- Updating an User --------------------- 
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};

// --------------------- Deleting an User--------------------- 
exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined'
    });
};