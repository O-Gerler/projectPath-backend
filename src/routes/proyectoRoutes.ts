import { Router } from "express";
import { body, param } from "express-validator";
import { ProyectoController } from "../controllers/ProyectoController";
import { handleInputErrors } from "../middleware/validation";
import { TareaController } from "../controllers/TareaController";
import { validarProyectosExiste } from "../middleware/proyecto";
import { tieneAutorizacion, validarTareaExiste, validarTareaPerteneceAProyecto } from "../middleware/tarea";
import { autenticar } from "../middleware/auth";
import { ColaboradorController } from "../controllers/ColaboradorController";
import NotaController from "../controllers/NotaController";

const router = Router();

router.use(autenticar)

// Rutas proyectos

router.get("/", ProyectoController.obtenerProyectos);

router.post("/",
  body("nombre")
    .notEmpty()
    .withMessage("El nombre no puede ir vacio"),
  body("cliente")
    .notEmpty()
    .withMessage("El nombre del cliente no puede ir vacio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripcion no puede ir vacio"),
  handleInputErrors,
  ProyectoController.crearProyecto
);

router.get("/:id", 
  param("id")
    .isMongoId()
    .withMessage("Id no valido"),
  handleInputErrors,
  ProyectoController.obtenerProyectoPorId
)

router.put("/:id",
  param("id")
    .isMongoId()
    .withMessage("Id no valido"),
  body("nombre")
    .notEmpty()
    .withMessage("El nombre no puede ir vacio"),
  body("cliente")
    .notEmpty()
    .withMessage("El nombre del cliente no puede ir vacio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripcion no puede ir vacio"),
  handleInputErrors, 
  ProyectoController.actualizarProyecto
)

router.delete("/:id",
  param("id")
    .isMongoId()
    .withMessage("Id no valido"),
  handleInputErrors,
  ProyectoController.eliminarProyecto  
)

// Rutas tareas
router.param("idProyecto", validarProyectosExiste) // Cada una de las rutas que utilice este parametro se aplicara este middleware

router.get(
  "/:idProyecto/tareas",
  param("idProyecto")
    .isMongoId()
    .withMessage("Id no valido"),
  handleInputErrors,
  TareaController.obtenerTareas
)

router.post(
  "/:idProyecto/tareas", 
  param("idProyecto")
    .isMongoId()
    .withMessage("Id no valido"),
  body("nombre")
    .notEmpty()
    .withMessage("El nombre no puede ir vacio"),
  body("descripcion")
    .notEmpty()
    .withMessage("La descripcion no puede ir vacio"),
  handleInputErrors,
  tieneAutorizacion,
  TareaController.crearTarea
)

router.param("idTarea", validarTareaExiste)
router.param("idTarea", validarTareaPerteneceAProyecto)

router.get(
  "/:idProyecto/tareas/:idTarea",
  param("idProyecto")
    .isMongoId()
    .withMessage("Id no valido"),
  param("idTarea")
    .isMongoId()
    .withMessage("Id no valido"),
  handleInputErrors,
  TareaController.obtenerTareaPorId
)

router.put(
  "/:idProyecto/tareas/:idTarea",
  param("idProyecto")
    .isMongoId()
    .withMessage("Id no valido"),
  param("idTarea")
    .isMongoId()
    .withMessage("Id no valido"),
  handleInputErrors,
  tieneAutorizacion,
  TareaController.actualizarTarea
)

router.delete(
  "/:idProyecto/tareas/:idTarea",
  param("idProyecto")
    .isMongoId()
    .withMessage("Id no valido"),
  param("idTarea")
    .isMongoId()
    .withMessage("Id no valido"),
  handleInputErrors,
  tieneAutorizacion,
  TareaController.eliminarTarea
)

router.post(
  "/:idProyecto/tareas/:idTarea/estado",
  param("idProyecto")
    .isMongoId()
    .withMessage("Id no valido"),
  param("idTarea")
    .isMongoId()
    .withMessage("Id no valido"),
  body("estado")
    .notEmpty()
    .withMessage("El estado no puede estar vacio"),
  handleInputErrors,
  TareaController.actualizarEstado
)

// Rotas para colaboradores
router.post(
  "/:idProyecto/colaboradores/buscar",
  param("idProyecto")
    .isMongoId()
    .withMessage("Id no valido"),
  body("email")
    .notEmpty()
    .withMessage("El email no puede ir vacio"),
  handleInputErrors,
  ColaboradorController.buscarColaboradorPorEmail
)

router.get(
  "/:idProyecto/colaboradores",
  ColaboradorController.obtenerColaboradores
)

router.post(
  "/:idProyecto/colaboradores",
  body("id")
    .isMongoId()
    .withMessage("ID no valido"),
  handleInputErrors,
  ColaboradorController.agregarColaboradorPorId
)

router.delete(
  "/:idProyecto/colaboradores/:idUsuario",
  param("idUsuario")
    .isMongoId()
    .withMessage("ID no valido"),
  handleInputErrors,
  ColaboradorController.eliminarColaboradorPorId
)

// Rutas Notas
router.post(
  "/:idProyecto/tareas/:idTarea/notas",
  body("contenido")
    .notEmpty()
    .withMessage("La nota no puede ir vacia"),
  handleInputErrors,
  NotaController.crearNota
)

router.get(
  "/:idProyecto/tareas/:idTarea/notas",
  NotaController.obtenerNotas
)

router.delete(
  "/:idProyecto/tareas/:idTarea/notas/:idNota",
  param("idNota")
    .isMongoId()
    .withMessage("ID tarea no valido"),
  handleInputErrors,
  NotaController.eliminarNota
)

export default router;