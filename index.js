/*
 * Name : index.js
 * Dev : Maxance
 * Feature : control everything in the backend logic
 * Version : 1.0
 */

require('dotenv').config();
const dotenv = require('dotenv');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/apiRoutes');
const jobController = require('./controllers/jobController');
const app = express();
app.use(cors());
app.use(express.json());

// Connect to mongodb
const mongoString = process.env.MONGODB_URI;

mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => console.log(error));



//routes
app.use('/api', apiRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});