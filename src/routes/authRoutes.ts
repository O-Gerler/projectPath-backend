import { Router } from "express";
import { body, param } from "express-validator";
import { AuthController } from "../controllers/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { autenticar } from "../middleware/auth";

const router = Router();

router.post(
  "/crear-cuenta",
  body("nombre").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("email").notEmpty().withMessage("El email no puede ir vacio"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("El password debe ser como minimo de 8 caracteres"),
  body("password-confirmacion").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Los password no son iguales");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.crearCuenta
);

router.post(
  "/confirmar-cuenta",
  body("token").notEmpty().withMessage("El token no puede ir vacio"),
  handleInputErrors,
  AuthController.confirmarCuenta
);

router.post(
  "/iniciar-sesion",
  body("email").notEmpty().withMessage("El email no puede ir vacio"),
  body("password").notEmpty().withMessage("El password no puede ir vacio"),
  handleInputErrors,
  AuthController.iniciarSesion
);

router.post(
  "/pedir-codigo-confirmacion",
  body("email").notEmpty().withMessage("El email no puede ir vacio"),
  handleInputErrors,
  AuthController.pedirCodigoConfirmacion
);

router.post(
  "/restablecer-password",
  body("email").notEmpty().withMessage("El email no puede ir vacio"),
  handleInputErrors,
  AuthController.restablecerPassword
);

router.post(
  "/validar-token-password",
  body("token").notEmpty().withMessage("El token no puede ir vacio"),
  handleInputErrors,
  AuthController.validarTokenPassword
);

router.post(
  "/actualizar-password/:token",
  param("token").isNumeric().withMessage("Token no valido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("El password debe ser como minimo de 8 caracteres"),
  body("password-confirmacion").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Los password no son iguales");
    }
    return true;
  }),
  handleInputErrors,
  AuthController.actualizarPasswordConToken
)

router.get("/", autenticar, AuthController.usuario)

// Perfil

router.put(
  "/perfil",
  body("nombre")
    .notEmpty()
    .withMessage("El nombre no puede ir vacio"),
  body("email")
    .notEmpty()
    .withMessage("El email no puede ir vacio"),
  handleInputErrors,
  autenticar,
  AuthController.actualizarPerfil
)

router.post(
  "/cambiar-password-actual",
  body("password_actual")
    .notEmpty()
    .withMessage("El password actual no puede ir vacio"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("El password debe ser como minimo de 8 caracteres"),
  body("password-confirmacion").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Los password no son iguales");
    }
    return true;
  }),
  handleInputErrors,
  autenticar,
  AuthController.actualizarPassword
)

router.post(
  "/revisar-password",
  body("password")
    .notEmpty()
    .withMessage("El passowrd no puede ir vacio"),
  handleInputErrors,
  autenticar,
  AuthController.revisarPassword
)

export default router;
