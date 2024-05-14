import Mensaje from "../models/Mensaje"
import { Types } from "mongoose"
import Proyecto from "../models/Proyecto"

type tipoMensaje = { mensaje: string, idAutor: Types.ObjectId, idProyecto: Types.ObjectId }

export class MensajeController {
  static crearMensaje = async ( data: tipoMensaje) =>{
    const mensaje = new Mensaje()
    mensaje.autor = data.idAutor
    mensaje.contenido = data.mensaje
    mensaje.proyecto = data.idProyecto

    try {
      const proyecto = await Proyecto.findById(data.idProyecto)

      proyecto.mensajes = [...proyecto.mensajes, mensaje]
      Promise.allSettled([ mensaje.save(), proyecto.save() ])
    } catch (error) {
      console.log(error)
    }
  }
}