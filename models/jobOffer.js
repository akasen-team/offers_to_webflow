const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    offre_id: { type: String, required: true, unique: true },
    titre: { type: String, required: true },
    societe: { type: String, required: true },
    desc_societe: { type: String },
    desc_poste: { type: String },
    desc_profil: { type: String },
    desc_langue: { type: String },
    contrat_lib: { type: String },
    contrat_code: { type: String },
    temps_travail: { type: String },
    pays: { type: String },
    codepostal: { type: String },
    ville: { type: String },
    etude_level: { type: String },
    etude_id: { type: String },
    experience: { type: String },
    experience_id: { type: String },
    desc_salaire: { type: String },
    sal_min: { type: Number },
    sal_max: { type: Number },
    avantages: { type: String },
    salvisible: { type: String },
    remote_type: { type: String },
    remote_id: { type: String },
    metier: { type: String },
    metier_id: { type: String },
    apply_url: { type: String, required: true },
    apply_mail: { type: String, required: true }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
