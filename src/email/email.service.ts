import { Injectable, ConsoleLogger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new ConsoleLogger(EmailService.name);

  constructor() {
    this.logger.log('Initializing EmailService...');

    // Configuración para Gmail (o cualquier SMTP)
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Nota: Puedes cambiar esto a 'host' y 'port' si no usas Gmail directo
      auth: {
        user: process.env.MAIL_USER, // Tu correo
        pass: process.env.MAIL_PASS, // Tu App Password
      },
    });

    // Verificar conexión al iniciar
    if (process.env.MAIL_USER && process.env.MAIL_PASS) {
      this.transporter.verify((error, success) => {
        if (error) {
          this.logger.error('SMTP Connection Error:', error);
        } else {
          this.logger.log('SMTP Server is ready to take our messages');
        }
      });
    } else {
      this.logger.warn('MAIL_USER or MAIL_PASS not configured. Email sending will fail.');
    }
  }

  async sendSupportNotification(
    userEmail: string,
    userName: string,
    message: string,
    userId: string,
  ) {
    const adminEmail = 'carojas@sudamericano.edu.ec';

    const mailOptions = {
      from: `"EchoBeat Support" <${process.env.MAIL_USER}>`,
      to: adminEmail,
      replyTo: userEmail, // Para que al dar "Responder" le llegue al usuario
      subject: `Nuevo Mensaje de Soporte - ${userName}`,
      html: `
        <h2>Nuevo Mensaje de Soporte</h2>
        <p><strong>Usuario:</strong> ${userName} (${userEmail})</p>
        <p><strong>ID Usuario:</strong> ${userId}</p>
        <hr />
        <h3>Mensaje:</h3>
        <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</p>
        <hr />
        <p><em>Para responder a este usuario, simplemente responde a este correo.</em></p>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      // No lanzamos error para no bloquear la respuesta al usuario, pero logueamos
      return null;
    }
  }
}
