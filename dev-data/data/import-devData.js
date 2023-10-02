const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
dotenv.config({ path: '../../config.env' });
const Tour = require('../../models/tourModel');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('DB connection established');
  });
// read from json file
const tours = JSON.parse(fs.readFileSync(`tours-simple.json`, 'utf-8'));
// import data to db
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('data loaded successfully');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};

// Delete all data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data deleted successfully');
  } catch (err) {
    console.log(err.message);
  }
  process.exit();
};

if (process.argv[2] === '--import') importData();
else if (process.argv[2] === '--delete') deleteData();
console.log(process.argv);
