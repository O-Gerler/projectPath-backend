import { Request, Response } from "express";
import Nota from "../models/Nota";

export default class NotaController {
  static crearNota = async (req: Request, res: Response) => {
    const { contenido } = req.body;

    const nota = new Nota();
    (nota.contenido = contenido), (nota.creadoPor = req.usuario.id);
    nota.tarea = req.tarea.id;

    req.tarea.notas.push(nota.id);

    try {
      await Promise.allSettled([req.tarea.save(), nota.save()]);
      return res.send("Nota guardada correctamente");
    } catch (error) {
      return res.status(500).json({ error: "Hubo un error" });
    }
  };

  static obtenerNotas = async (req: Request, res: Response) => {
    try {
      const notas = await Nota.find({ tarea: req.tarea.id }).populate({
        path: "creadoPor tarea",
      });

      res.json(notas);
    } catch (error) {
      return res.status(500).json({ error: "Hubo un error" });
    }
  };

  static eliminarNota = async (req: Request, res: Response) => {
    const { idNota } = req.params;

    try {
      const nota = await Nota.findById(idNota);

      if (!nota) {
        const error = new Error("Nota no encontrada");
        return res.status(404).json({ error: error.message });
      }

      if (nota.creadoPor.toString() !== req.usuario.id.toString()) {
        const error = new Error("Accion no valida");
        return res.status(401).json({ error: error.message });
      }

      req.tarea.notas = req.tarea.notas.filter(
        (notaEliminar) => notaEliminar.id.toString() !== nota.id.toString()
      );

      await Promise.allSettled([req.tarea.save(), nota.deleteOne()]);
      res.send("Nota eliminada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
}
