const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});