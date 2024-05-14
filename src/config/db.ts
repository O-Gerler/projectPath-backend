import colors from "colors";
import mongoose from "mongoose";
import { exit } from "node:process"

export const db = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI)
    const url = `${connection.connection.host}:${connection.connection.port}`
    console.log(colors.magenta.bold(`MongoDB conectado en: ${url}`))
  } catch (error) {
    console.log(colors.red.bold("Error al conectar MongoDB"), URL)
    exit(1)
  }
}
