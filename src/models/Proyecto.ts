import mongoose, { Schema, Document, PopulatedDoc, Types} from "mongoose";
import Tarea, { ITarea } from "./Tarea";
import { IUsuario } from "./Usuario";
import Mensaje, { IMensaje } from "./Mensaje";
import Nota from "./Nota";

export interface IProjecto extends Document {
  nombre: string
  cliente: string 
  descripcion: string
  tareas: PopulatedDoc<ITarea & Document>[]
  manager: PopulatedDoc<IUsuario & Document>
  colaboradores: PopulatedDoc<IUsuario & Document>[]
  mensajes : PopulatedDoc<IMensaje & Document>[]
}

const ProyectoSchema: Schema = new Schema({
  nombre: {
    type: String,
    trim: true,
    required: true
  },
  cliente: {
    type: String,
    trim: true,
    required: true
  },
  descripcion: {
    type: String,
    trim: true,
    required: true
  },
  tareas: [
    {
      type: Types.ObjectId,
      ref: "Tarea"
    }
  ],
  manager: {
    type: Types.ObjectId,
    ref: "Usuario"
  },
  colaboradores: [
    {
      type: Types.ObjectId,
      ref: "Usuario"
    }
  ],
  mensajes: [
    {
      type: Types.ObjectId,
      ref: "Mensaje"
    }
  ]
}, {
  timestamps: true
})

ProyectoSchema.pre("deleteOne", {document: true}, async function() {
  const idProyecto = this.id
  if(!idProyecto) return 

  const tareas = await Tarea.find({proyecto: idProyecto})

  for(const tarea of tareas) {
    await Nota.deleteMany({tarea: tarea.id})
  }

  await Tarea.deleteMany({proyecto: idProyecto})
  await Mensaje.deleteMany({proyecto: idProyecto})

})

const Proyecto = mongoose.model<IProjecto>('Proyecto', ProyectoSchema)
export default Proyecto