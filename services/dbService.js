/*
 * Name : dbService.js
 * Dev : Massimo
 * Feature : This service will manage only interactions with database.
 * Description : It will write, clone and delete job offers from the database.
 * Version : 1.0 => clone, write, deletion
 */

const Job = require('../models/jobOffer'); 
const mongoose = require('mongoose');

// Fonction d'écriture des offres
async function writeJobs(jobDataArray) {
    try {
        for (const jobData of jobDataArray) {
            // Vérifier si l'offre existe déjà dans la base
            const existingJob = await Job.findOne({ offre_id: jobData.offre_id });
            
            // Si l'offre n'existe pas, l'ajouter
            if (!existingJob) {
                await Job.create(jobData);
                //console.log(`Nouvelle offre ajoutée : ${jobData.titre}`);
            } else {
                //console.log(`Offre déjà existante : ${jobData.titre}`);
            }
        }
        console.log(`${jobDataArray.length} offres enregistrées dans MongoDB.`);
    } catch (err) {
        console.error(`Erreur lors de l'enregistrement de ${jobData.titre} :`, err.message);
    }
}

// Fonction de suppression des offres obsolètes
async function deleteJobs(jobDataArray) {
    // Récupérer toutes en base de données
    const existingJobsId = await Job.find({}, 'offre_id').then(jobs => jobs.map(job => job.offre_id));
    // Récupérer toutes les id des offres de jobpostingpro
    const apiJobsId = new Set(jobDataArray.map(job => job.offre_id));
    // Filtrer les offres obsolètes
    const obsoleteJobsId = [...existingJobsId].filter(id => !apiJobsId.has(id));
    // Supprimer les offres obsolètes
    if (obsoleteJobsId.length > 0) {
        await Job.deleteMany({ offre_id: { $in: obsoleteJobsId } });
        console.log(`${obsoleteJobsId.length} offres obsolètes supprimées de MongoDB.`);
    } else {
        console.log("Aucune offre obsolète à supprimer.");
    }
}

// Fonction de developpement pour cloner les jobs
async function cloneJobs(jobDataArray) {
    try {
        // Récupérer toute la base
        const jobs = await Job.find({});

        // Cloner les documents en modifiant leur `_id` et `offre_id`
        const clonedJobs = jobs.map(job => {
            const clonedJob = job.toObject();
            clonedJob._id = new mongoose.Types.ObjectId();
            clonedJob.offre_id = `${job.offre_id}_clone`;
            return clonedJob;
        });

        // Insérer les documents clonés dans la collection
        await Job.insertMany(clonedJobs);
        console.log(`${clonedJobs.length} jobs clonés avec succès.`);
    } catch (error) {
        console.error("Erreur lors du clonage des jobs :", error.message);
    }
}

module.exports = {
    writeJobs,
    cloneJobs,
    deleteJobs
};