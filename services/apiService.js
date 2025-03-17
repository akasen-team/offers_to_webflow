/*
 * Name : apiService.js
 * Dev : Maxance
 * Feature : This service will manage all interactions with jobposting's API.
 * how : 
 * Version : 1.0
 */

const Job = require('../models/jobOffer'); 
const axios = require('axios');

// const url = "https://www.jobposting.pro/flux/clients/json/modele.json";
const url = "https://www.jobposting.pro/flux/clients/json/ikiway.json";

exports.fetchData = async function () {
    console.log("fetchData() a été appelée");

    try {
        const response = await axios.get(url);
        const jobDataArray = response.data;

        console.log(`${jobDataArray.length} offres récupérées.`);

        for (const jobData of jobDataArray) {
            try {
                // Check if job offer already exists
                const existingJob = await Job.findOne({ offre_id: jobData.offre_id });

                if (!existingJob) {
                    // Store new job offer
                    await Job.create(jobData);
                    console.log(`🆕 Nouvelle offre ajoutée : ${jobData.titre}`);
                } else {
                    console.log(`🔄 Offre déjà existante : ${jobData.titre}`);
                }
            } catch (err) {
                console.error(`Erreur lors de l'enregistrement de ${jobData.titre} :`, err.message);
            }
        }

        console.log("Enregistrement terminé.");
        return jobDataArray;
    } catch (error) {
        console.error("Erreur dans fetchData():", error.message);
        throw error;
    }
};
