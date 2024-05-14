import { json, Request, Response } from "express";
import Usuario from "../models/Usuario";
import Proyecto from "../models/Proyecto";

export class ColaboradorController {
  static buscarColaboradorPorEmail = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
      const usuario = await Usuario.findOne({ email }).select(
        "_id nombre email"
      );
      if (!usuario) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      res.json(usuario);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static agregarColaboradorPorId = async (req: Request, res: Response) => {
    const { id } = req.body;

    try {
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      if (req.proyecto.manager.toString() === usuario.id.toString()) {
        const error = new Error(
          "No puedes agregar el propietario del proyecto como colaborador"
        );
        return res.status(409).json({ error: error.message });
      }

      if (
        req.proyecto.colaboradores.some(
          (colaborador) => colaborador.toString() === usuario.id.toString()
        )
      ) {
        const error = new Error("El usuario ya es colaborador del proyecto");
        return res.status(409).json({ error: error.message });
      }

      req.proyecto.colaboradores.push(usuario.id);
      await req.proyecto.save();

      res.send("Colaborador agregado correctamente");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static eliminarColaboradorPorId = async (req: Request, res: Response) => {
    const { idUsuario } = req.params;

    try {
      if (
        !req.proyecto.colaboradores.some(
          (colaborador) => colaborador.toString() === idUsuario
        )
      ) {
        const error = new Error("El usuario no es colaborador del proyecto");
        return res.status(409).json({ error: error.message });
      }

      req.proyecto.colaboradores = req.proyecto.colaboradores.filter(
        (colaborador) => colaborador.toString() !== idUsuario
      );

      await req.proyecto.save();
      res.send("Colaborador eliminado correctamente");
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static obtenerColaboradores = async (req: Request, res: Response) => {
    try {
      const proyecto = await Proyecto.findById(req.proyecto.id).populate({
        path: "colaboradores",
        select: "id email nombre",
      });

      return res.json(proyecto.colaboradores);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Hubo un error" });
    }
  };
}
