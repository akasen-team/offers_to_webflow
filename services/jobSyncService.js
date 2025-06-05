// services/jobSyncService.js

const IGNORED_FIELDS = ['_id', 'offre_id', 'createdAt', 'updatedAt', '__v'];

/**
 * Retourne les différences entre deux objets (niveau 1 uniquement)
 * @param {Object} existing - job en base
 * @param {Object} incoming - job depuis l'API
 * @returns {Object|null} - null si rien à modifier, sinon { champ: { old, new } }
 */
function getModifiedFields(existing, incoming) {
    const diffs = {};

    for (const key in incoming) {
        if (IGNORED_FIELDS.includes(key)) continue;

        const oldValue = existing[key];
        const newValue = incoming[key];

        const areEqual =
            oldValue === newValue ||
            (oldValue == null && newValue == null) || // null/undefined
            (typeof oldValue === 'number' && typeof newValue === 'number' && isNaN(oldValue) && isNaN(newValue));

        if (!areEqual) {
            diffs[key] = { old: oldValue, new: newValue };
        }
    }

    return Object.keys(diffs).length > 0 ? diffs : null;
}

/**
 * Renvoie true si au moins un champ a changé
 */
function needsUpdate(existing, incoming) {
    return !!getModifiedFields(existing, incoming);
}

module.exports = {
    getModifiedFields,
    needsUpdate
};