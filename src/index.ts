import { createServer } from "http"
import { Server } from "socket.io"
import colors from "colors"
import server from "./server"
import { MensajeController } from "./controllers/MensajeController"

const port = process.env.PORT || 4000

const httpServer = createServer(server)
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL]
  }
})

io.on("connection", socket => {
  socket.on("join_room", data => {
    socket.join(data)
  })

  socket.on("send_message", data => {
    MensajeController.crearMensaje(data)
    socket.to(data.idProyecto).emit("receive_message", data)
  })

  socket.on("disconnect", () => {
    // console.log("desconectado")
  })
})

httpServer.listen(port, () => {
  console.log(colors.cyan.bold(`Server en el puerto: ${port}`))
})