import jwt from "jsonwebtoken"

export const generarJWT = id => jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "7d"})

export const verificarJWT = token => jwt.verify(token, process.env.JWT_SECRET)
