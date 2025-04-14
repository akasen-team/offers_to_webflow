const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Route to send offers
router.get('/jobs', jobController.getAllJobs);
router.get('/jobs/last-six', jobController.getLastSixJobs);
router.get('/jobs/:id', jobController.getJobById);

module.exports = router;