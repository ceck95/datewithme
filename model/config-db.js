var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/datewithme');

module.exports = mongoose;