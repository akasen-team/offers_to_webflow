const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Route to fetch offers
router.get('/jobs', jobController.getJobs);

// Route to send offers to webflow
router.post('/webflow/send-jobs', jobController.sendJobsToWebflow);

module.exports = router;
