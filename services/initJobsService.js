const jobController = require('../controllers/jobController');
const apiService = require('./apiService');
const dbService = require('./dbService');
const webflowService = require('./webflowService');

// j'initialise le travail des offres
// je vais aller fetcher les offres depuis jobposting pro
// et en fetchant j enregistre tout, ce qui va devenir ma res
async function initJobsWork() {
    try {
        // Quand fetchData a fini de s'exécuter, cela signifie que les données sont enregistrées
        console.log("Début des tâches avec jobpostingpro");
        const jobs = await apiService.fetchData();
        console.log("Fin des tâches avec jobpostingpro");

        console.log("Début des tâches dans mongoDB");
        //await dbService.cloneJobs(jobs); // developpement seulement
        await dbService.deleteJobs(jobs);
        await dbService.writeJobs(jobs);
        console.log("Fin des tâches dans mongoDB");
        
        //Quand les données sont enregistrées, je les envoie à Webflow
        console.log("Tentative d'envoi des offres d'emploi vers Webflow...");
        await webflowService.syncJobsToWebflow();
        console.log("Offres envoyées à Webflow avec succès");

        return { success: true };
    
    } catch (error) {
        console.error("Erreur dans les jobs", error.message);
        return { success: false, error: error.message };
    }
}

module.exports = { initJobsWork };