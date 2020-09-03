const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/productdb',{ useNewUrlParser: true })
module.exports = mongoose.connection;