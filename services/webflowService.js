const axios = require('axios');
require('dotenv').config();
const Job = require('../models/jobOffer');

const WEBFLOW_API_URL = 'https://api.webflow.com/v2/collections';
const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;
const SITE_ID = process.env.WEBFLOW_SITE_ID; 
const COLLECTION_ID = process.env.COLLECTION_ID;

// Get webflow's collection ID
async function getWebflowCollectionId() {
    try {
        //console.log(`Récupération des collections Webflow pour le site ID: ${SITE_ID}`);

        const response = await axios.get(`https://api.webflow.com/v2/sites/${SITE_ID}/collections`, {
            headers: {
                'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
                'accept-version': '2.0',
                'Content-Type': 'application/json'
            }
        });

        //console.log("Collections Webflow found :", response.data);

        // Seeking collection "Jobs"
        const collection = response.data.collections.find(col => col.displayName === "Jobs");

        if (!collection) {
            throw new Error("Collection Webflow 'Jobs' non trouvée");
        }

        console.log(`Collection Webflow trouvée : ID ${collection.id}`);
        return collection.id;
    } catch (error) {
        console.error("Error while getting webflow collection's ID:", error.response?.data || error.message);
        throw error;
    }
}

// Get a valid domain from webflow
async function getWebflowValidDomain() {
    console.log(`Getting webflow domains for de the website ID: ${process.env.WEBFLOW_SITE_ID}`);

    try {
        const response = await axios.get(
            `https://api.webflow.com/v2/sites/${process.env.WEBFLOW_SITE_ID}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                    'accept-version': '2.0'
                }
            },
        );

        console.log("Response Webflow Site Info :", response.data);

        // Vérifier si Webflow retourne des domaines valides
        if (!response.data.customDomains || response.data.customDomains.length === 0) {
            console.log("Aucun domaine personnalisé trouvé, utilisation du staging Webflow.io...");
            return `${process.env.WEBFLOW_SITE_SLUG}.webflow.io`;
        }

        // Utiliser le premier domaine valide
        const validDomain = response.data.customDomains[0].name;
        console.log(`Domaine Webflow autorisé trouvé : ${validDomain}`);
        return validDomain;

    } catch (error) {
        console.error("Erreur lors de la récupération du domaine Webflow :", error.response?.data || error.message);
        throw error;
    }
}

// Fonction pour publier correctement les offres Webflow
async function publishWebflowCollection() {
    console.log("Tentative de publication de la collection mise à jour...");

    try {
        // Récupération d'un domaine valide
        let domainId = process.env.WEBFLOW_DOMAIN_ID;
        if (!domainId) {
            console.log("Domaine Webflow non défini dans .env, récupération en cours...");
            domainId = await getWebflowValidDomain();
            process.env.WEBFLOW_DOMAIN_ID = domainId; // Stocker pour éviter de le récupérer à chaque appel
        }

        console.log(`Domaine Webflow utilisé pour la publication : ${domainId}`);

        // Envoi de la requête de publication
        const response = await axios.post(
            `https://api.webflow.com/v2/sites/${process.env.WEBFLOW_SITE_ID}/publish`,
            {
                collections: [process.env.WEBFLOW_COLLECTION_ID], // Collection ID récupérée
                domains: [domainId] // Domaine valide récupéré
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WEBFLOW_API_TOKEN}`,
                    'accept-version': '2.0',
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Collection publiée avec succès :", response.data);
    } catch (error) {
        console.error("Erreur lors de la publication de la collection dans Webflow :", error.response?.data || error.message);
    }
}

// Fonction pour récupérer toutes les offres existantes dans Webflow
async function getExistingWebflowJobs() {

    try {
        const response = await axios.get(
            `https://api.webflow.com/v2/collections/${COLLECTION_ID}/items`,
            {
                headers: {
                    'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
                    'accept-version': '2.0'
                }
            }
        );

        // Vérifier si on reçoit bien des données
        if (!response.data.items || response.data.items.length === 0) {
            console.log("Aucune offre existante trouvée sur Webflow.");
            return new Set();
        }

        // Extraction des `reference-id` (ou `name` si besoin)
        //const existingJobs = new Set(response.data.items.map(item => item["fieldData"]["reference-id"]));
        const existingJobs = response.data.items.map(item => ({
            referenceId: item["fieldData"]["reference-id"],
            itemId: item.id,
        }))

        //console.log(`${existingJobs.size} offres déjà présentes dans Webflow.`);
        //console.log("Offres existantes dans Webflow :", existingJobs);
        return existingJobs;

    } catch (error) {
        console.error("Erreur lors de la récupération des offres Webflow :", error.response?.data || error.message);
        return new Set(); //Retourne un Set vide en cas d'erreur pour éviter les bugs
    }
}

// Fonction pour supprimer les offres obsolètes de Webflow
async function deleteObsoleteJobs(existingWebflowJobs) {
    console.log("Suppression des offres obsolètes dans Webflow");

    try {
        // Récupération des offres existantes dans Webflow
        //const existingWebflowJobs = await getExistingWebflowJobs();

        // Récupération des offres existantes dans MongoDB
        // Penser à créer un Set afin de pouvoir utiliser .has method
        const jobs = await Job.find({});
        const mongoJobsId = new Set(jobs.map(job => job.offre_id));

        // Identifier les offres obsolètes (présentes dans Webflow mais pas dans MongoDB)
        const obsoleteJobs = existingWebflowJobs.filter(job => !mongoJobsId.has(job.referenceId));

        //console.log("Offres obsolètes trouvées :", obsoleteJobs);
        // Si pas d'offres obsolètes, dans ce cas là on sort et on passe à la suite (C'est à dire l'écriture des nouvelles offres)
        if (obsoleteJobs.length === 0) {
            console.log("Aucune offre obsolète à supprimer dans Webflow.");
            return;
        }
        console.log(`${obsoleteJobs.length} offres obsolètes trouvées dans Webflow :`, obsoleteJobs);

        // Supprimer les offres obsolètes de Webflow
        for (const job of obsoleteJobs) {
            const { referenceId, itemId } = job;
            console.log(`Suppression de l'offre obsolète ${referenceId} (${itemId}) de Webflow...`);
            try {
                await axios.delete(
                    `https://api.webflow.com/v2/collections/${COLLECTION_ID}/items/${itemId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
                            'accept-version': '2.0'
                        }
                    }
                );
                console.log(`Offre supprimée de Webflow : ${job.referenceId}`);
            } catch (error) {
                console.error(`Erreur lors de la suppression de l'offre ${job.referenceId} dans Webflow :`, error.response?.data || error.message);
            }
        }

        console.log("Suppression des offres obsolètes terminée.");
    } catch (error) {
        console.error("Erreur lors de la suppression des offres obsolètes dans Webflow :", error.message);
    }
}

// Fonction pour publier les nouvelles offres dans Webflow
async function publishJobsToWebflow(collectionId, existingWebflowJobs) {
    console.log("Publication des nouvelles offres dans Webflow...");
    const results = [];

    try {
        // Récupération des offres existantes dans Webflow
        //const existingWebflowJobs = await getExistingWebflowJobs();

        // Récupération des offres MongoDB
        const jobs = await Job.find({});
        
        //console.log("Vérification des offres déjà présentes dans Webflow");
        for (const job of jobs) {
            // Vérifier si l'offre existe déjà sur Webflow
            if (existingWebflowJobs.has(job.offre_id)) {
                console.log(`Offre déjà existante, pas d'ajout : ${job.titre}`);
                continue;
            }

            try {
                // TODO : décrire comment on map les champs entre notre serveur et le site d'Ikiway
                const webflowJob = {
                    items: [
                        {
                            fieldData: {
                                "reference-id": job.offre_id,
                                "titre-du-poste": job.titre,
                                "name": job.titre,
                                "slug": job.offre_id,
                                "responsable": job.societe,
                                "email-du-reponsable": job.apply_mail,
                                "description-du-poste": job.desc_poste || "",
                                "aboutcompany": job.desc_societe || "",
                                "searchedprofile": job.desc_profil || "",
                                "localisation": job.ville || "",
                                "postalcode": job.codepostal || "",
                                "sector": job.metier || "",
                                "contracttype": job.contrat_lib || "",
                                "salary": `${job.sal_min || ''} - ${job.sal_max || ''}`,
                                "avantages": job.desc_salaire || "",
                                "timeperweek": job.temps_travail || "",
                                "schedules": job.remote_type || "",
                                "project-id": job.apply_url
                            }
                        }
                    ]
                };

                console.log(`Envoi de l'offre '${job.titre}' vers Webflow...`);

                const response = await axios.post(
                    `https://api.webflow.com/v2/collections/${collectionId}/items`,
                    webflowJob,
                    {
                        headers: {
                            'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
                            'accept-version': '2.0',
                            'Content-Type': 'application/json'
                        }
                    }
                );
                if (response.status === 200 || response.status === 201) {
                    results.push({ job: job.titre, status: 'success' });
                    console.log(`Offre '${job.titre}' publiée avec succès dans Webflow.`);
                    console.log("Détails de la réponse :", response.data);
                } else {
                    results.push({ job: job.titre, status: 'error' });
                    console.error(`Erreur lors de la publication de '${job.titre}' :`, response.status, response.statusText);
                }
                console.log("Publication des offres terminée")
            } catch (err) {
                console.error(`Erreur lors de l'ajout de '${job.titre}' :`, err.response?.data || err.message);
            }
        }
        console.log("Publication des offres terminée");
    } catch (error) {
        console.error("Erreur lors de la publication des offres dans Webflow :", error.message);
    }
}

exports.syncJobsToWebflow = async function () {
    try {
        // Récupération de l'ID de la collection si non défini
        let collectionId = process.env.WEBFLOW_COLLECTION_ID;
        if (!collectionId) {
            console.log("ID de la collection Webflow non trouvé, récupération...");
            collectionId = await getWebflowCollectionId();
            process.env.WEBFLOW_COLLECTION_ID = collectionId;
        }
        //console.log(`Collection Webflow ID : ${collectionId}`);

        // Récupération des offres existantes dans Webflow
        // On veut a la fois un array et un Set pour faciliter l utilisation ultérieure
        const existingWebflowJobs = await getExistingWebflowJobs();
        //console.log("Offres existantes dans Webflow :", existingWebflowJobs);
        //if (existingWebflowJobs.length != null) {
        const existingWebflowJobsId = new Set(existingWebflowJobs.map(job => job.referenceId));
        //}

        // Suppression des offres obsolètes
        await deleteObsoleteJobs(existingWebflowJobs);

        // Publication des nouvelles offres
        await publishJobsToWebflow(collectionId, existingWebflowJobsId);

        // Publier la collection après ajout des offres
        await publishWebflowCollection();

        console.log("Toutes les offres ont été traitées");
    } catch (error) {
        console.error("Erreur lors de l'envoi des offres à Webflow :", error.message);
    }
};