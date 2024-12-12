const Tour = require('./../models/tourModel');

// --------------------- Getting All Tours --------------------- 
exports.getAllTours = async (req, res) => {
    try{
        const tours = await Tour.find();

        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours: tours
            }
        });
    } catch(error) {
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }
};

// --------------------- Getting Tour by ID --------------------- 
exports.getTour = async (req, res) => {
    try{
        const tour = await Tour.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        });
    }catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error
        });
    }

};

// --------------------- Creating a new Tour --------------------- 
exports.createTour = async (req, res) => {
    try{
        const newTour = await Tour.create(req.body);

        res.status(200).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    } 
};

// --------------------- Updating a Tour --------------------- 
exports.updateTour = async (req, res) => {
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        });

    }catch (error) {
        res.status(400).json({
            status: 'fail',
            message: "Invalid data sent!"
        });
    }
};

// --------------------- Deleting a tour --------------------- 
exports.deleteTour = async (req, res) => {
    try{
        await Tour.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        });

    } catch( error ){
        res.status(400).json({
            status: 'fail',
            message: "Invalid data sent!"
        });
    }
};
