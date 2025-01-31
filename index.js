/*
 * Name : index.js
 * Dev : Maxance
 * Feature : control everything in the backend logic
 * Version : 1.0
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jobsRoutes = require('./routes/jobsRoutes');
const jobController = require('./controllers/jobController');
const app = express();
app.use(cors());
app.use(express.json());

// Connect to mongodb
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
})
.then(() => console.log('✅ Connexion à MongoDB réussie'))
.catch(err => console.error('❌ Erreur de connexion à MongoDB:', err.message));


//json
app.use(express.json());

//routes
app.use('/api', jobsRoutes);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});

// Fetch job Offers at the server startup
async function executeInitialJobs() {
    console.log("⚡ Exécution des tâches de démarrage...");
    try {
        await jobController.getJobs({ query: {} }, { json: console.log }); // Simuler une réponse JSON en console
        console.log("✅ Tâches de démarrage exécutées avec succès !");
    } catch (error) {
        console.error("❌ Erreur lors de l'exécution des tâches de démarrage:", error.message);
    }
};

executeInitialJobs();