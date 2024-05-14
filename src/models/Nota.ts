import mongoose, { Schema, Document, Types } from "mongoose";

export interface INota extends Document {
  contenido: string,
  creadoPor: Types.ObjectId
  tarea: Types.ObjectId
}

const NotaSchema : Schema = new Schema({
  contenido: {
    type: String,
    required: true
  },
  creadoPor: {
    type: Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  tarea: {
    type: Types.ObjectId,
    ref: "Tarea",
    required: true
  }
}, {
  timestamps: true
})

const Nota = mongoose.model<INota>("Nota", NotaSchema)
export default Nota