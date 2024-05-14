import bcrypt from "bcryptjs"

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

export const compararPassword = async (password: string, storedHash: string) => {
  return await bcrypt.compare(password, storedHash)
}