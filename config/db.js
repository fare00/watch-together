const mongoose = require('mongoose');
const { dbUri } = require('./keys');

mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true }, err => {
    if(!err) console.log('Connected to DB!');
});