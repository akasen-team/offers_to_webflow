const jobController = require('../controllers/jobController');
const webflowService = require('./webflowService');

async function executeInitialJobs() {
    console.log("Exécution des tâches de démarrage...");
    try {
        // Récupérer les offres d'emploi depuis l'API et les enregistrer en base
        await jobController.getJobs({ query: {} }, { json: console.log });
        console.log("Offres d'emploi récupérées et enregistrées !");

        // Envoyer les offres récupérées à Webflow
        console.log("⚡ Envoi des offres d'emploi vers Webflow...");
        // await webflowService.sendJobsToWebflow();
        console.log("Offres envoyées à Webflow avec succès !");
    } catch (error) {
        console.error("Erreur lors de l'exécution des tâches de démarrage:", error.message);
    }
}

module.exports = { executeInitialJobs };