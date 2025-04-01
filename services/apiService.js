/*
 * Name : apiService.js
 * Dev : Maxance, Massimo
 * Feature : This service will manage all interactions with jobposting's API.
 * description : It gets all the offers from jobpostingpro => then write or delete it from mongodb
 * how : 
 * Version : 1.3 => isolate this service to manage only jobpostingpro API
 */

const Job = require('../models/jobOffer'); 
const axios = require('axios');
const mongoose = require('mongoose');

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

        return jobDataArray;
    } catch (error) {
        console.error("Erreur dans fetchData:", error.message);
        throw error;
    }
};