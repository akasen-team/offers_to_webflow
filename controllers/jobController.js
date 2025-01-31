/*
 * Name : jobController.js
 * Dev : Maxance
 * Feature : all method to manage data incomming from external API
 * how : Basic CRUD opérations, adding an auto save into mongodb when the app get JSON data from the Jarvii API
 * detail :
 * Version : 1.0
 */

const jobOffer = require('../models/jobOffer');
const mongoose = require('mongoose');
const apiService = require('../services/apiService');






module.exports = { saveProjects };