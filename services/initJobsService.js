const jobController = require('../controllers/jobController');
const apiService = require('./apiService');
const webflowService = require('./webflowService');

// j'initialise le travail des offres
// je vais aller fetcher les offres depuis jobposting pro
// et en fetchant j enregistre tout, ce qui va devenir ma res
async function initJobsWork() {
    console.log("Exécution de getJobs()...");

    try {
        // Quand fetchData a fini de s'exécuter, cela signifie que les données sont enregistrées
        console.log("Tentative de récupération des offres d'emploi depuis jobpostingpro...");
        const jobs = await apiService.fetchData();
        console.log("Données enregistrées en base");
        
        //Quand les données sont enregistrées, je les envoie à Webflow
        console.log("Tentative d'envoi des offres d'emploi vers Webflow...");
        await webflowService.sendJobsToWebflow();
        console.log("Offres envoyées à Webflow avec succès");
    
    } catch (error) {
        console.error("Erreur dans les jobs", error.message);
    }
}

module.exports = { initJobsWork };