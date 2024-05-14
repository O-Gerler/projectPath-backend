import type { Request, Response } from "express";
import Usuario from "../models/Usuario";
import { compararPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generarToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generarJWT } from "../utils/jwt";

export class AuthController {
  static crearCuenta = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;

      // Prevenir duplicados
      const usuarioExiste = await Usuario.findOne({ email });
      if (usuarioExiste) {
        const error = new Error("El usuario ya esta registrado");
        return res.status(409).json({ error: error.message });
      }

      // Crear un usuario
      const usuario = new Usuario(req.body);

      // Hashear password
      usuario.password = await hashPassword(password);

      // Generar token
      const token = new Token();
      token.token = generarToken();
      token.usuario = usuario.id;

      // Enviar el email
      AuthEmail.enviarEmailConfirmacion({
        email,
        nombre: usuario.nombre,
        token: token.token,
      });

      // Guardar usuario en BBDD
      await Promise.allSettled([usuario.save(), token.save()]);

      res.send("Cuenta creada correctamente, revisa tu email para confirmarla");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static confirmarCuenta = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExiste = await Token.findOne({ token });

      if (!tokenExiste) {
        const error = new Error("El token no existe");
        return res.status(404).json({ error: error.message });
      }

      const usuario = await Usuario.findById(tokenExiste.usuario);
      if (!usuario) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      usuario.confirmado = true;

      await Promise.allSettled([usuario.save(), tokenExiste.deleteOne()]);
      res.send("Usuario confirmado correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static iniciarSesion = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const usuario = await Usuario.findOne({ email });
      if (!usuario) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      if (!usuario.confirmado) {
        const token = new Token();
        token.usuario = usuario.id;
        token.token = generarToken();
        await token.save();

        AuthEmail.enviarEmailConfirmacion({
          email,
          nombre: usuario.nombre,
          token: token.token,
        });

        const error = new Error(
          "Usuario no confirmado, hemos enviado un email de confirmacion"
        );
        return res.status(401).json({ error: error.message });
      }

      const esPasswordCorrecta = await compararPassword(
        password,
        usuario.password
      );
      if (!esPasswordCorrecta) {
        const error = new Error("Password incorrecto");
        res.status(401).json({ error: error.message });
      }

      const token = generarJWT(usuario.id);
      res.send(token);
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static pedirCodigoConfirmacion = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const usuario = await Usuario.findOne({ email });
      if (!usuario) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      if (usuario.confirmado) {
        const error = new Error("Usuario ya confirmado");
        return res.status(403).json({ error: error.message });
      }

      const token = new Token();
      token.token = generarToken();
      token.usuario = usuario.id;
      await token.save();

      AuthEmail.enviarEmailConfirmacion({
        email,
        nombre: usuario.nombre,
        token: token.token,
      });

      res.send("Se envio un codigo, por favor revisa tu email");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error " });
    }
  };

  static restablecerPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const usuario = await Usuario.findOne({ email });
      if (!usuario) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      const token = new Token();
      token.token = generarToken();
      token.usuario = usuario.id;
      await token.save();

      AuthEmail.enviarEmailRestablecerPassword({
        email,
        nombre: usuario.nombre,
        token: token.token,
      });

      res.send("Se envio un codigo, por favor revisa tu email");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error " });
    }
  };

  static validarTokenPassword = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      const tokenExiste = await Token.findOne({ token });
      if (!tokenExiste) {
        const error = new Error("Token no encontrado");
        return res.status(404).json({ error: error.message });
      }

      const usuario = await Usuario.findById(tokenExiste.usuario);
      if (!usuario) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      res.send("Token valido, restablece tu password");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static actualizarPasswordConToken = async (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      const { token } = req.params;

      const tokenExiste = await Token.findOne({ token });
      if (!tokenExiste) {
        const error = new Error("Token no encontrado");
        return res.status(404).json({ error: error.message });
      }

      const usuario = await Usuario.findById(tokenExiste.usuario);
      if (!usuario) {
        const error = new Error("Usuario no encontrado");
        return res.status(404).json({ error: error.message });
      }

      usuario.password = await hashPassword(password);

      await Promise.allSettled([usuario.save(), tokenExiste.deleteOne()]);
      res.send("El password se modifico correctamente");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  static usuario = async (req: Request, res: Response) => res.json(req.usuario);

  static actualizarPerfil = async (req: Request, res: Response) => {
    const { nombre, email } = req.body;

    const usuarioExiste = await Usuario.findOne({ email });
    if (
      usuarioExiste &&
      usuarioExiste.id.toString() !== req.usuario.id.toString()
    ) {
      const error = new Error("El email ya esta en uso");
      return res.status(409).json({ error: error.message });
    }

    if (nombre === req.usuario.nombre && email === req.usuario.email) {
      const error = new Error(
        "No se puede actualizar si los valores son los mismos"
      );
      return res.status(409).json({ error: error.message });
    }

    req.usuario.nombre = nombre;
    req.usuario.email = email;

    try {
      await req.usuario.save();
      res.send("Usuario actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static actualizarPassword = async (req: Request, res: Response) => {
    const { password_actual, password } = req.body;

    try {
      const usuario = await Usuario.findById(req.usuario.id);

      const passwordCorrecta = await compararPassword(
        password_actual,
        usuario.password
      );
      if (!passwordCorrecta) {
        const error = new Error("El password actual no es correcto");
        return res.status(401).json({ error: error.message });
      }

      usuario.password = await hashPassword(password);
      await usuario.save();
      res.send("Password actualzada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error " });
    }
  };

  static revisarPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    try {
      const usuario = await Usuario.findById(req.usuario.id);

      const passwordCorrecta = await compararPassword(
        password,
        usuario.password
      );

      if (!passwordCorrecta) {
        const error = new Error("El password actual no es correcto");
        return res.status(401).json({ error: error.message });
      }

      res.send("Password correcto");
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" });
    }
  };
}
