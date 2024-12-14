const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

// ------------------------- DATABASE --------------------------
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true

}).then(con => console.log("DB connection sucessful!"));

// ------------------------- Reading JSON File --------------------------
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// ------------------------- Importing data into DB --------------------------
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data successfully loaded!');
    } catch (error) {
        console.log(error);
    }
    process.exit();
};

// ------------------------- DELETE all data from DB --------------------------
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data succcesfully deleted!');
    } catch (error){
        console.log(error);
    }
    process.exit();
}

// Defining how to run the file
if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete'){
    deleteData();
}

console.log(process.argv);

// TO RUN THIS SCRIPT, run:
// node dev-data/data/import-dev-data.js [--delete/--import]