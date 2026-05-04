import User from "./user.model.js";
import cloudinary from "cloudinary";
import { hash, verify } from "argon2"
import { sendEmail } from "../helpers/sendEmail.js";


export const getUser = async (req, res) => {
  try {
    const user = await User.find({ state: true });

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const userWithImage = user.map((userImage) => {
      const userObj = userImage.toObject();

      userObj.imageUrl = userImage.profilePicture
        ? cloudinary.v2.url(userImage.profilePicture)
        : null;

      return userObj;
    });

    return res.status(200).json({
      success: true,
      services: userWithImage,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error getting users",
      error: err.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const id = req.usuario._id;
    const data = req.body;

    const user = await User.findByIdAndUpdate(id, data, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userObj = user.toObject();
    userObj.imageUrl = user.profilePicture
      ? cloudinary.v2.url(user.profilePicture)
      : null;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
      imageUrl: userObj.imageUrl,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error updating user",
      error: err.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.usuario._id;

    const user = await User.findByIdAndUpdate(
      id,
      { state: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: err.message,
    });
  }
};

export const updateImage = async (req, res) => {
  try {
    const id = req.usuario._id;
    const file = req.file.filename;

    const user = await User.findById(id);

    if (file) {
      if (user.profilePicture) {
        await cloudinary.v2.uploader.destroy(user.profilePicture);
      }

      user.profilePicture = file;

      await user.save();
    }

    const userObj = user.toObject();
    userObj.imageUrl = user.profilePicture
      ? cloudinary.v2.url(user.profilePicture)
      : null;

    return res.status(200).json({
      success: true,
      message: "Image updated successfully",
      user: userObj,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error updating image",
      error: err.message,
    });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const id = req.usuario._id;
    const user = await User.findById(id);

    if (user.profilePicture) {
      await cloudinary.v2.uploader.destroy(user.profilePicture);
    }

    user.profilePicture = null;
    await user.save();

    const userObj = user.toObject();
    userObj.imageUrl = user.imageProduct
      ? cloudinary.v2.url(user.imageProduct)
      : null;

    return res.status(200).json({
      success: true,
      message: "Servicio actualizado",
      user: userObj,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error deleting image",
      error: err.message,
    });
  }
};


export const modificarContraseña = async (req, res) => {
    try {
        const userId = req.usuario.id;  
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const correctPassword = await verify(user.password, oldPassword);

        if (!correctPassword) {
            return res.status(400).json({
                message: "The old password is incorrect"
            });
        }

        const hashedPassword = await hash(newPassword);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            message: "Password updated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error updating password",
            error: error.message
        });
    }
};

export const getMyUser = async (req, res) => {
  try {
    const id = req.usuario._id;
    const user = await User.find({ _id: id, state: true });

    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const userWithImage = user.map((userImage) => {
      const userObj = userImage.toObject();

      userObj.imageUrl = userImage.profilePicture
        ? cloudinary.v2.url(userImage.profilePicture)
        : null;

      return userObj;
    });

    return res.status(200).json({
      success: true,
      services: userWithImage,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error getting users",
      error: err.message,
    });
  }
};


export const checkAuth = (req, res) =>{
  res.status(200).json({
    success:true,
    user: req.usuario
  });
}


export const updatePassword = async (req, res) => {
  try {
      const { email, nuevaContraseña } = req.body;

      const user = await User.findOne({ email: email });
      
      if (!user) {
          return res.status(404).json({
              success: false,
              message: 'No se encontró ninguna cuenta con el correo proporcionado'
          });
      }

      const encryptPassword = await hash(nuevaContraseña);

      let entity, entityType;
      if (user) {
          user.password = encryptPassword;
          await user.save();
          entity = user;
          entityType = 'usuario';
      }

      const nombre = entity.name || `${entity.name} ${entity.surname}`;
      const nombreUsuario = entity.username || entity.email;

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f4f6f9;
              padding: 0;
              margin: 0;
            }
            .container {
              max-width: 600px;
              margin: 30px auto;
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
              padding: 30px;
            }
            h2 {
              color: #2b535c;
              text-align: center;
              margin-bottom: 20px;
            }
            .info {
              background-color: #f0f4f8;
              border-left: 6px solid #426a73;
              padding: 15px 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .info p {
              margin: 8px 0;
              font-size: 15px;
              color: #333333;
            }
            .footer {
              text-align: center;
              font-size: 13px;
              color: #888888;
              margin-top: 30px;
            }
            .cta {
              display: block;
              width: fit-content;
              margin: 25px auto;
              background-color: #2b535c;
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: bold;
              transition: background 0.3s ease;
            }
            .cta:hover {
              background-color: #426a73;
            }
            .warning {
              color: #d32f2f;
              font-size: 14px;
              text-align: center;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Kivora</h2> 
            <h2>🔒 Contraseña actualizada exitosamente</h2>

            <p>Hola ${nombre},</p>
            
            <p>Te confirmamos que la contraseña de tu cuenta ${entityType} ha sido actualizada correctamente.</p>

            <div class="info">
              <p><strong>👤 ${entityType === 'usuario' ? 'Usuario' : 'Nombre'}:</strong> ${nombreUsuario}</p>
              <p><strong>📧 Correo:</strong> ${entity.email}</p>
              <p><strong>🕒 Fecha de actualización:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p class="warning">
              Si no realizaste este cambio, por favor contacta a nuestro equipo de soporte inmediatamente.
            </p>


            <div class="footer">
              © ${new Date().getFullYear()} Kivora. Todos los derechos reservados.
            </div>
          </div>
        </body>
      </html>
      `;

      await sendEmail({
          to: email,
          subject: 'Contraseña actualizada - Kivora',
          html: htmlContent
      });

      const responseData = {
          success: true,
          message: 'Contraseña actualizada exitosamente',
          tipo: entityType,
          datos: {
              nombre: entity.nombre,
              correo: entity.correo,
              fechaActualizacion: new Date()
          }
      };

      if (entityType === 'usuario') {
          responseData.datos.apellido = entity.apellido;
          responseData.datos.nombreUsuario = entity.nombreUsuario;
      } else {
          responseData.datos.razonSocial = entity.razonSocial;
      }

      return res.status(200).json(responseData);

  } catch (err) {
      return res.status(500).json({
          success: false,
          message: 'Error al actualizar la contraseña',
          error: err.message
      });
  }
};