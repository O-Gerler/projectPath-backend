import mongoose, { Schema, Document } from "mongoose";

export interface IUsuario extends Document {
  email: string,
  password: string,
  nombre: string,
  confirmado: boolean
}

const UsuarioSchema: Schema = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    trim: true,
    required: true
  },
  nombre: {
    type: String,
    trim: true,
    required: true
  },
  confirmado: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

const Usuario = mongoose.model<IUsuario>('Usuario', UsuarioSchema)
export default Usuario