import mongoose, { Document, Schema, Types } from "mongoose";
import Nota from "./Nota";

const estadosTarea = {
  PENDIENTE: "pendiente",
  EN_ESPERA: "en espera",
  EN_PROGRESO: "en progreso",
  EN_REVISION: "en revision",
  COMPLETADA: "completada",
} as const;

export type EstadosTarea = (typeof estadosTarea)[keyof typeof estadosTarea];

export interface ITarea extends Document {
  nombre: string;
  descripcion: string;
  estado: EstadosTarea;
  proyecto: Types.ObjectId;
  completadoPor: {
    usuario: Types.ObjectId,
    estado: EstadosTarea
  }[]
  notas: Types.ObjectId[]
}

const TareaSchema: Schema = new Schema(
  {
    nombre: {
      type: String,
      trim: true,
      required: true,
    },
    descripcion: {
      type: String,
      trim: true,
      required: true,
    },
    estado: {
      type: String,
      enum: Object.values(estadosTarea),
      default: estadosTarea.PENDIENTE,
    },
    proyecto: {
      type: Types.ObjectId,
      ref: "Proyecto",
      required: true,
    },
    completadoPor: [
      {
        usuario: {
          type: Types.ObjectId,
          ref: "Usuario",
          default: null,
        },
        estado: {
          type: String,
          enum: Object.values(estadosTarea),
          default: estadosTarea.PENDIENTE,
        },
      },
    ],
    notas: [
      {
        type: Types.ObjectId,
        ref: "Nota"
      }
    ]
  },
  {
    timestamps: true,
  }
);

// Middleware
TareaSchema.pre("deleteOne", { document: true }, async function() {
  const idTarea = this._id
  if(!idTarea) return 
  await Nota.deleteMany({ tarea: idTarea })
})

const Tarea = mongoose.model<ITarea>("Tarea", TareaSchema);
export default Tarea;
