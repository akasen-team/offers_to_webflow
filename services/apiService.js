/*
 * Name : apiService.js
 * Dev : Maxance, Massimo
 * Feature : This service will manage all interactions with jobposting's API.
 * description : It gets all the offers from jobpostingpro => then write or delete it from mongodb
 * how : 
 * Version : 1.2 => deletion of obsolete offers
 */

const Job = require('../models/jobOffer'); 
const axios = require('axios');

const url = "https://www.jobposting.pro/flux/clients/json/ikiway.json";

exports.fetchData = async function () {
    console.log("fetchData() a été appelée");

    try {
        const response = await axios.get(url);
        // get all job offers from API
        if (!response || !response.data) {
            throw new Error("Aucune donnée reçue de l'API.");
        }
        const jobDataArray = response.data;
        console.log(`${jobDataArray.length} offres récupérées.`);

        // Get all id of jon offers from the API
        const apijobsId = jobDataArray.map(job => job.offre_id);

        // Get all ids of job offers already stored in the database
        const existingJobsId = await Job.find({}, 'offre_id').then(jobs => jobs.map(job => job.offre_id));

        // TODO : test
        // Delete jobs that are no longer in the API
        const obsoleteJobsId = [...existingJobsId].filter(id => !apiJobsId.has(id));
        if (obsoleteJobsId.length > 0) {
            await Job.deleteMany({ offre_id: { $in: obsoleteJobsId } });
            console.log(`${obsoleteJobsId.length} offres obsolètes supprimées de MongoDB.`);
        } else {
            console.log("Aucune offre obsolète à supprimer.");
        }


        for (const jobData of jobDataArray) {
            try {
                // Check if job offer already exists
                const existingJob = await Job.findOne({ offre_id: jobData.offre_id });

                if (!existingJob) {
                    // Store new job offer
                    await Job.create(jobData);
                    console.log(`Nouvelle offre ajoutée : ${jobData.titre}`);
                } else {
                    console.log(`Offre déjà existante : ${jobData.titre}`);
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
