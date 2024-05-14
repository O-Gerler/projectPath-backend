import { Request, Response } from "express";
import Proyecto from "../models/Proyecto";

export class ProyectoController {
  static obtenerProyectos = async (req: Request, res: Response) => {
    try {
      const proyectos = await Proyecto.find({
        $or: [
          { manager: { $in: req.usuario.id } },
          { colaboradores: { $in: req.usuario.id } },
        ],
      });
      res.json(proyectos);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static crearProyecto = async (req: Request, res: Response) => {
    const proyecto = new Proyecto(req.body);
    proyecto.manager = req.usuario.id;

    try {
      await proyecto.save();
      res.send("Proyecto creado correctamente");
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static obtenerProyectoPorId = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const proyecto = await Proyecto.findById(id)
        .populate("tareas")
        .populate({
          path: "colaboradores",
          select: "_id nombre email",
        })
        .populate({
          path: "manager",
          select: "_id nombre email"
        })
        .populate({
          path: "mensajes",
          populate: {
            path: "autor",
            select: "_id nombre email"
          }
        })

      if (!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }

      if (
        proyecto.manager.id.toString() !== req.usuario.id.toString() &&
        !proyecto.colaboradores.some(
          (colaborador) =>
            colaborador._id.toString() === req.usuario.id.toString()
        )
      ) {
        const error = new Error("Accion no valida");
        return res.status(403).json({ error: error.message });
      }

      res.json(proyecto);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static actualizarProyecto = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const proyecto = await Proyecto.findByIdAndUpdate(id, req.body);

      if (!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }

      if (proyecto.manager.toString() !== req.usuario.id.toString()) {
        const error = new Error("Accion no valida");
        return res.status(403).json({ error: error.message });
      }
      await proyecto.save();
      res.send("Proyecto actualizado correctamente");
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static eliminarProyecto = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const proyecto = await Proyecto.findById(id);

      if (!proyecto) {
        const error = new Error("Proyecto no encontrado");
        return res.status(404).json({ error: error.message });
      }

      if (proyecto.manager.toString() !== req.usuario.id.toString()) {
        const error = new Error("Accion no valida");
        return res.status(403).json({ error: error.message });
      }

      await proyecto.deleteOne();
      res.send("Proyecto eliminado correctamente");
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Hubo un error" });
    }
  };
}
