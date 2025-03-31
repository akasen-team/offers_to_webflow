/*
 * Name : index.js
 * Dev : Maxance
 * Feature : control everything in the backend logic
 * Version : 1.0.0
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
//const jobsRoutes = require('./routes/jobsRoutes');
const jobController = require('./controllers/jobController');
const webflowService = require('./services/webflowService');
const jobsWork = require('./services/initJobsService');
const cron = require('node-cron');
const app = express();
app.use(cors());
app.use(express.json());

// Connect to mongodb
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
})
.then(() => console.log('Connexion à MongoDB réussie'))
.catch(err => console.error('Erreur de connexion à MongoDB:', err.message));

//json
app.use(express.json());

// Init middleware
(async () => {
    try {
        console.log("Démarrage des tâches initiales...");
        await jobsWork.initJobsWork();
        if (result.success) {
            console.log("Tâches initiales terminées avec succès !");
        } else {
            console.error("Tâches initiales échouées :", result.error);
        }
    } catch (error) {
        console.error("Erreur lors de l'exécution des tâches initiales :", error.message);
    }
})();

// scheduling the cron task to run it every 0600L
cron.schedule('0 */6 * * *', async () => {
    console.log("[CRON] Mise à jour automatique des offres d'emploi...");
    try {
        await jobsWork.initJobsWork();
        console.log("[CRON] Mise à jour terminée !");
    } catch (error) {
        console.error("[CRON] Erreur lors de la mise à jour :", error.message);
    }
});

// Confirmation de la planification du CRON
console.log("[CRON] Planification activée : mise à jour des offres toutes les 6 heures");

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});