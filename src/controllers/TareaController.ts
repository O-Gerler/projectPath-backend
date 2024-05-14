import { Request, Response } from "express";
import Tarea from "../models/Tarea";

export class TareaController {
  
  static obtenerTareas = async (req: Request, res: Response) => {
    const { _id } = req.proyecto

    try {
      const tareas = await Tarea.find({proyecto: _id}).populate("proyecto")
      res.json(tareas)
    } catch (error) {
      console.log(error.message)
      res.status(500).json({ error: "Hubo un error" })
    }
  } 

  static crearTarea = async (req: Request, res: Response) => {
    try {
      const tarea = new Tarea(req.body)

      tarea.proyecto = req.proyecto.id
      req.proyecto.tareas.push(tarea.id)

      await Promise.allSettled([tarea.save(), req.proyecto.save()])

      res.send("Tarea creada correctamente")
    } catch (error) {
      console.log(error.message)
    }
  } 

  static obtenerTareaPorId = async (req: Request, res: Response) => {
    try {
      const { id } = req.tarea
      const tarea = await Tarea.findById(id).populate({
        path: "completadoPor.usuario",
        select: "id nombre"
      }).populate({
        path: "notas", populate: { 
          path: "creadoPor",
          select: "id nombre email"
        }
      })
      
      res.json(tarea)
    } catch (error) {
      console.log(error.message)
    }
  }

  static actualizarTarea = async (req: Request, res: Response) => {
    const { nombre , descripcion, estado } = req.body

    req.tarea.nombre = nombre || req.tarea.nombre
    req.tarea.descripcion = descripcion || req.tarea.descripcion
    req.tarea.estado = estado || req.tarea.estado
    
    try {
      await req.tarea.save()
      res.send("Tarea actualizada correctamente")
    } catch (error) {
      console.log(error.message)
    }
  }

  static eliminarTarea = async (req: Request, res: Response) => {
    try {
      req.proyecto.tareas = req.proyecto.tareas.filter(tarea => tarea.toString() !== req.tarea.id.toString())

      await Promise.allSettled([req.tarea.deleteOne(), req.proyecto.save()])

      res.send("Tarea eliminada correctamente")
    } catch (error) {
      console.log(error.message)
    }
  }

  static actualizarEstado = async (req: Request, res: Response) => {
    const { estado } = req.body

    try {
      req.tarea.estado = estado

      const data = {
        usuario: req.usuario.id,
        estado
      }

      req.tarea.completadoPor.push(data)
      await req.tarea.save()
      res.send("Tarea actualizada correctamente")
    } catch (error) {
      console.log(error.message)
    }
  }
}