/*
 * Name : jobController.js
 * Dev : Maxance, Massimo
 * Feature : all method to manage data incomming from external API
 * how : Basic CRUD opérations, adding an auto save into mongodb when the app get JSON data from offers API
 * details :
 * Version : 1.0.1 => remove unnecessary documentation
 */

const jobs = require('../models/jobOffer');
const apiService = require('../services/apiService');

exports.getJobs = async (req, res) => {
    console.log("🔵 Exécution de getJobs()...");

    try {
        const jobs = await apiService.fetchData();
        console.log("🟢 Données enregistrées en base.");
        
        if (res && res.json) {
            res.json(jobs);
        }
    } catch (error) {
        console.error("❌ Erreur dans getJobs():", error.message);
        if (res && res.status) {
            res.status(500).json({ error: "Erreur lors de la récupération des offres d'emploi" });
        }
    }
};