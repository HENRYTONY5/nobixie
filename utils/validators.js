/**
 * Utilidades de validación para el proyecto
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 8;

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
const validateEmail = (email) => {
    return emailRegex.test(email);
};

/**
 * Validar fortaleza de contraseña
 * @param {string} password - Contraseña a validar
 * @returns {boolean}
 */
const validatePassword = (password) => {
    return password && password.length >= passwordMinLength;
};

/**
 * Validar que las contraseñas coincidan
 * @param {string} pass - Primera contraseña
 * @param {string} passConfirm - Confirmación de contraseña
 * @returns {boolean}
 */
const validatePasswordMatch = (pass, passConfirm) => {
    return pass === passConfirm;
};

/**
 * Validar ID numérico
 * @param {string|number} id - ID a validar
 * @returns {boolean}
 */
const validateId = (id) => {
    return id && !isNaN(id) && parseInt(id) > 0;
};

/**
 * Validar campos obligatorios
 * @param {object} fields - Objeto con los campos a validar
 * @returns {array} Array con los campos vacíos
 */
const validateRequiredFields = (fields) => {
    const emptyFields = [];
    for (const [key, value] of Object.entries(fields)) {
        if (!value || (typeof value === 'string' && !value.trim())) {
            emptyFields.push(key);
        }
    }
    return emptyFields;
};

module.exports = {
    validateEmail,
    validatePassword,
    validatePasswordMatch,
    validateId,
    validateRequiredFields,
    passwordMinLength
};
