import { body, param } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { handleErrors } from "./handle-errors.js";
import { validateJWT } from "./validate-jwt.js";

export const authMiddleware = [
    validateJWT,
    handleErrors
];

export const authProductOwnerMiddleware = [
    validateJWT,
    handleErrors
];


export const authScrumMasterMiddleware = [
    validateJWT,
    handleErrors
];

