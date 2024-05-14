import mongoose, { Schema, Document, Types } from "mongoose";

export interface IToken extends Document {
  token: string,
  usuario: Types.ObjectId,
  createdAt: Date,
}

const TokenSchema : Schema = new Schema({
  token: {
    type: String,
    required: true
  },
  usuario: {
    type: Types.ObjectId,
    ref: "Usuario"
  },
  expiresAt: {
    type: Date,
    default: Date.now(),
    expires: "10m"
  }
})

const Token = mongoose.model<IToken>("Token", TokenSchema)
export default Token