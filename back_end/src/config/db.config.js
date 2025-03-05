const mongoose = require('mongoose');
mongoose.Promise = global.Promise

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME
  })
    .then(() => console.log('Connect successfully'))
    .catch(err => {
      console.error(err.message)
      process.exit();
    })
};

module.exports = connectDB;
