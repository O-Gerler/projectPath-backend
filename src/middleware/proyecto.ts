import { Request, Response, NextFunction } from "express";
import Proyecto, { IProjecto } from "../models/Proyecto";

declare global {
  namespace Express {
    interface Request {
      proyecto: IProjecto
    }
  }
}

export async function validarProyectosExiste(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { idProyecto } = req.params;
    const proyecto = await Proyecto.findById(idProyecto);

    if (!proyecto) {
      const error = new Error("El proyecto no existe");
      return res.status(404).json({ error: error.message });
    }

    req.proyecto = proyecto
    next()
  } catch (error) {
    res.status(500).json({ error: "Hubo un error" });
  }
}
