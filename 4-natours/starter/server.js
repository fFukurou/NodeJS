const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
const app = require('./app');

// ------------------------- DATABASE --------------------------
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true

}).then(con => console.log("DB connection sucessful!"));


// --------------------- Running the Server --------------------- 
const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
    
});

process.on('unhandledRejection', err => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});





// no comment