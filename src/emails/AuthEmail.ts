import { transporter } from "../config/nodemailer";

interface IEmail {
  email: string;
  nombre: string;
  token: string;
}

export class AuthEmail {
  static enviarEmailConfirmacion = async (usuario: IEmail) => {
    await transporter.sendMail({
      from: "ProjectPath <admin@projectpath.com>",
      to: usuario.email,
      subject: "ProjectPath - Confirma tu cuenta",
      text: "ProjectPath - Confirma tu cuenta",
      html: `
        <p>Hola ${usuario.nombre}, has creado tu cuenta en ProjectPath, ya casi esta todo listo, solo debes confirmar tu cuenta</p>
        <p>Visita el siguiente enlace: <a href="${process.env.FRONTEND_URL}/auth/confirmar-cuenta">Confirmar cuenta</a></p>
        <p>E ingresa el codigo: <b>${usuario.token}</b></p>
        <p>Este token expira en 10 minutos</p>
      `,
    });
  };

  static enviarEmailRestablecerPassword = async (usuario: IEmail) => {
    await transporter.sendMail({
      from: "ProjectPath <admin@projectpath.com>",
      to: usuario.email,
      subject: "ProjectPath - Restablecer Password",
      text: "ProjectPath - Restablecer Password",
      html: `
        <p>Hola ${usuario.nombre}, has solicitado restablecer tu password.</p>
        <p>Visita el siguiente enlace: <a href="${process.env.FRONTEND_URL}/auth/nueva-password">Restablece tu password</a></p>
        <p>E ingresa el codigo: <b>${usuario.token}</b></p>
        <p>Este token expira en 10 minutos</p>
      `,
    });
  };
}
