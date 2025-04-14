/*
 * Name : jobController.js
 * Dev : Maxance, Massimo
 * Feature : all method to manage data incomming from external API
 * how : Basic CRUD opérations, adding an auto save into mongodb when the app get JSON data from offers API
 * details :
 * Version : 1.0.1 => remove unnecessary documentation and unused code
 * V1.0.1 is Depracated : les controllers ne sont pas utiles chez Ikiway, car ils servent à répondre à des requetes HHTP. Or, on a aucunes requetes HTTP entrentes
    * car on ne fait pas d'API REST. On a juste un cron job qui va chercher les données et les envoie à Webflow.
    * On peut donc supprimer tous les controllers et les routes.
    * 
 * V2.0 is a normal CRUD app
 */

const mongoose = require('mongoose');
const Job = require('../models/jobOffer');

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error });
  }
}
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job', error });
  }
}
exports.getLastSixJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).limit(6);
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error });
  }
}