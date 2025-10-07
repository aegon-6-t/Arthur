/**
 * Middleware de validation des données
 * Utilise express-validator pour valider les entrées utilisateur
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware pour traiter les erreurs de validation
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

/**
 * Règles de validation pour l'authentification
 */
const authValidation = {
    // Validation pour la connexion
    login: [
        body('email')
            .isEmail()
            .withMessage('L\'email doit être valide')
            .normalizeEmail()
            .trim(),
        body('mot_de_passe')
            .isLength({ min: 6 })
            .withMessage('Le mot de passe doit contenir au moins 6 caractères')
            .trim()
    ],

    // Validation pour l'inscription
    register: [
        body('nom')
            .isLength({ min: 2, max: 100 })
            .withMessage('Le nom doit contenir entre 2 et 100 caractères')
            .trim()
            .escape(), // Protection XSS
        body('prenom')
            .isLength({ min: 2, max: 100 })
            .withMessage('Le prénom doit contenir entre 2 et 100 caractères')
            .trim()
            .escape(),
        body('email')
            .isEmail()
            .withMessage('L\'email doit être valide')
            .normalizeEmail()
            .trim(),
        body('mot_de_passe')
            .isLength({ min: 8 })
            .withMessage('Le mot de passe doit contenir au moins 8 caractères')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
            .trim(),
        body('role')
            .optional()
            .isIn(['admin', 'user'])
            .withMessage('Le rôle doit être admin ou user')
    ],

    // Validation pour le changement de mot de passe
    changePassword: [
        body('ancien_mot_de_passe')
            .notEmpty()
            .withMessage('L\'ancien mot de passe est requis')
            .trim(),
        body('nouveau_mot_de_passe')
            .isLength({ min: 8 })
            .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
            .trim()
    ]
};

/**
 * Règles de validation pour le planning
 */
const planningValidation = {
    // Validation pour la création d'un événement
    createEvent: [
        body('titre')
            .isLength({ min: 3, max: 255 })
            .withMessage('Le titre doit contenir entre 3 et 255 caractères')
            .trim()
            .escape(),
        body('description')
            .optional()
            .isLength({ max: 1000 })
            .withMessage('La description ne peut pas dépasser 1000 caractères')
            .trim()
            .escape(),
        body('date_debut')
            .isISO8601()
            .withMessage('La date de début doit être au format ISO 8601')
            .custom((value) => {
                const date = new Date(value);
                if (date < new Date()) {
                    throw new Error('La date de début ne peut pas être dans le passé');
                }
                return true;
            }),
        body('date_fin')
            .isISO8601()
            .withMessage('La date de fin doit être au format ISO 8601')
            .custom((value, { req }) => {
                const dateDebut = new Date(req.body.date_debut);
                const dateFin = new Date(value);
                if (dateFin <= dateDebut) {
                    throw new Error('La date de fin doit être postérieure à la date de début');
                }
                return true;
            }),
        body('type_evenement')
            .optional()
            .isIn(['reunion', 'formation', 'maintenance', 'autre'])
            .withMessage('Le type d\'événement doit être: reunion, formation, maintenance ou autre'),
        body('statut')
            .optional()
            .isIn(['planifie', 'en_cours', 'termine', 'annule'])
            .withMessage('Le statut doit être: planifie, en_cours, termine ou annule'),
        body('salle')
            .optional()
            .isLength({ max: 100 })
            .withMessage('Le nom de la salle ne peut pas dépasser 100 caractères')
            .trim()
            .escape(),
        body('participants')
            .optional()
            .isLength({ max: 500 })
            .withMessage('La liste des participants ne peut pas dépasser 500 caractères')
            .trim()
            .escape()
    ],

    // Validation pour la mise à jour d'un événement
    updateEvent: [
        body('titre')
            .optional()
            .isLength({ min: 3, max: 255 })
            .withMessage('Le titre doit contenir entre 3 et 255 caractères')
            .trim()
            .escape(),
        body('description')
            .optional()
            .isLength({ max: 1000 })
            .withMessage('La description ne peut pas dépasser 1000 caractères')
            .trim()
            .escape(),
        body('date_debut')
            .optional()
            .isISO8601()
            .withMessage('La date de début doit être au format ISO 8601'),
        body('date_fin')
            .optional()
            .isISO8601()
            .withMessage('La date de fin doit être au format ISO 8601'),
        body('type_evenement')
            .optional()
            .isIn(['reunion', 'formation', 'maintenance', 'autre'])
            .withMessage('Le type d\'événement doit être: reunion, formation, maintenance ou autre'),
        body('statut')
            .optional()
            .isIn(['planifie', 'en_cours', 'termine', 'annule'])
            .withMessage('Le statut doit être: planifie, en_cours, termine ou annule'),
        body('salle')
            .optional()
            .isLength({ max: 100 })
            .withMessage('Le nom de la salle ne peut pas dépasser 100 caractères')
            .trim()
            .escape(),
        body('participants')
            .optional()
            .isLength({ max: 500 })
            .withMessage('La liste des participants ne peut pas dépasser 500 caractères')
            .trim()
            .escape()
    ],

    // Validation pour les paramètres de requête
    queryParams: [
        query('date')
            .optional()
            .isISO8601()
            .withMessage('La date doit être au format ISO 8601'),
        query('startDate')
            .optional()
            .isISO8601()
            .withMessage('La date de début doit être au format ISO 8601'),
        query('endDate')
            .optional()
            .isISO8601()
            .withMessage('La date de fin doit être au format ISO 8601'),
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('La page doit être un nombre entier positif'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('La limite doit être un nombre entre 1 et 100'),
        query('q')
            .optional()
            .isLength({ min: 2, max: 100 })
            .withMessage('Le terme de recherche doit contenir entre 2 et 100 caractères')
            .trim()
            .escape()
    ]
};

/**
 * Règles de validation pour l'administration
 */
const adminValidation = {
    // Validation pour la création d'utilisateur par admin
    createUser: [
        body('nom')
            .isLength({ min: 2, max: 100 })
            .withMessage('Le nom doit contenir entre 2 et 100 caractères')
            .trim()
            .escape(),
        body('prenom')
            .isLength({ min: 2, max: 100 })
            .withMessage('Le prénom doit contenir entre 2 et 100 caractères')
            .trim()
            .escape(),
        body('email')
            .isEmail()
            .withMessage('L\'email doit être valide')
            .normalizeEmail()
            .trim(),
        body('mot_de_passe')
            .isLength({ min: 8 })
            .withMessage('Le mot de passe doit contenir au moins 8 caractères')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
            .trim(),
        body('role')
            .isIn(['admin', 'user'])
            .withMessage('Le rôle doit être admin ou user'),
        body('actif')
            .optional()
            .isBoolean()
            .withMessage('Le statut actif doit être un booléen')
    ],

    // Validation pour la mise à jour d'utilisateur par admin
    updateUser: [
        body('nom')
            .optional()
            .isLength({ min: 2, max: 100 })
            .withMessage('Le nom doit contenir entre 2 et 100 caractères')
            .trim()
            .escape(),
        body('prenom')
            .optional()
            .isLength({ min: 2, max: 100 })
            .withMessage('Le prénom doit contenir entre 2 et 100 caractères')
            .trim()
            .escape(),
        body('email')
            .optional()
            .isEmail()
            .withMessage('L\'email doit être valide')
            .normalizeEmail()
            .trim(),
        body('mot_de_passe')
            .optional()
            .isLength({ min: 8 })
            .withMessage('Le mot de passe doit contenir au moins 8 caractères')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
            .trim(),
        body('role')
            .optional()
            .isIn(['admin', 'user'])
            .withMessage('Le rôle doit être admin ou user'),
        body('actif')
            .optional()
            .isBoolean()
            .withMessage('Le statut actif doit être un booléen')
    ]
};

/**
 * Règles de validation pour les paramètres d'URL
 */
const paramValidation = {
    // Validation pour les IDs numériques
    id: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('L\'ID doit être un nombre entier positif')
    ],

    // Validation pour les IDs d'utilisateur
    userId: [
        param('userId')
            .isInt({ min: 1 })
            .withMessage('L\'ID utilisateur doit être un nombre entier positif')
    ]
};

module.exports = {
    handleValidationErrors,
    authValidation,
    planningValidation,
    adminValidation,
    paramValidation
};
