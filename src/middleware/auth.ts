import { NextFunction, Request, Response } from "express";
import { verificarJWT } from "../utils/jwt";
import Usuario, { IUsuario } from "../models/Usuario";

declare global {
  namespace Express {
    interface Request {
      usuario ?: IUsuario
    }
  }
}

export const autenticar = async (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization
  if(!bearer) {
    const error = new Error("No autorizado")
    return res.status(401).json({ error: error.message })
  }

  const token = bearer.split(" ")[1]

  try {
    const decodificacion = verificarJWT(token)

    if(typeof decodificacion === "object" && decodificacion.id){
      const usuario = await Usuario.findById(decodificacion.id).select("_id nombre email")
      if(!usuario) {
        const error = new Error("Usuario no existe")
        return res.status(404).json({ error : error.message })
      }

      req.usuario = usuario
      next()
    }
  } catch (error) {
    return res.status(500).json({ error: "Hubo un error"})
  }
}