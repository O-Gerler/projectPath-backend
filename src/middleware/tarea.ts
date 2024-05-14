import { Request, Response, NextFunction } from "express";
import Tarea, { ITarea } from "../models/Tarea";

declare global {
  namespace Express {
    interface Request {
      tarea: ITarea;
    }
  }
}

export async function validarTareaExiste(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { idTarea } = req.params;
    const tarea = await Tarea.findById(idTarea);

    if (!tarea) {
      const error = new Error("La tarea no existe");
      return res.status(404).json({ msg: error.message });
    }

    req.tarea = tarea;
    next();
  } catch (error) {
    res.status(500).json({ msg: "Hubo un error" });
  }
}

export function validarTareaPerteneceAProyecto(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.tarea.proyecto.toString() !== req.proyecto.id.toString()) {
    const error = new Error("Accion no valida");
    return res.status(400).json({ error: error.message });
  }

  next();
}

export function tieneAutorizacion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  
  if (req.usuario.id.toString() !== req.proyecto.manager.toString()) {
    console.log(req.usuario._id.toString(), req.proyecto.manager.toString())
    const error = new Error("No tienes autorizacion");
    return res.status(403).json({ error: error.message });
  }

  next();
}
