/*
 * Name : jobController.js
 * Dev : Maxance, Massimo
 * Feature : all method to manage data incomming from external API
 * how : Basic CRUD opérations, adding an auto save into mongodb when the app get JSON data from offers API
 * details :
 * Version : 1.0.1 => remove unnecessary documentation and unused code
 */

const apiService = require('../services/apiService');
const webflowService = require('../services/webflowService');

exports.getJobs = async (req, res) => {
    console.log("🔵 Exécution de getJobs()...");

    try {
        const jobs = await apiService.fetchData();
        console.log("Données enregistrées en base.");
        
        if (res && res.json) {
            res.json(jobs);
        }
    } catch (error) {
        console.error("Erreur dans getJobs():", error.message);
        if (res && res.status) {
            res.status(500).json({ error: "Erreur lors de la récupération des offres d'emploi" });
        }
    }
};


// Fonction pour envoyer les offres à Webflow
exports.sendJobsToWebflow = async (req, res) => {
    console.log("Envoi des offres d'emploi vers Webflow déclenché...");

    try {
        await webflowService.sendJobsToWebflow();
        res.json({ message: "Offres envoyées à Webflow avec succès" });
    } catch (error) {
        console.error("Erreur lors de l'envoi des offres à Webflow :", error.message);
        res.status(500).json({ error: "Erreur lors de l'envoi des offres à Webflow" });
    }
};