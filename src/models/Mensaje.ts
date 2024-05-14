import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMensaje extends Document {
  contenido: string,
  autor: Types.ObjectId
  proyecto: Types.ObjectId
}

const MensajeScheme : Schema = new Schema({
  autor: {
    type: Types.ObjectId,
    ref: "Usuario"
  },
  contenido: {
    type: String,
    trim: true,
    required: true
  },
  proyecto: {
    type: Types.ObjectId,
    ref: "Proyecto"
  }
}, {
  timestamps: true
})

const Mensaje = mongoose.model<IMensaje>("Mensaje", MensajeScheme)
export default Mensaje