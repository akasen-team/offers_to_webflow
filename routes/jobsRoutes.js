const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

// Route pour récupérer les offres d'emploi
router.get('/jobs', jobController.getJobs);

module.exports = router;
