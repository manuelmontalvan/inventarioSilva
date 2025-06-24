import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async sendResetPasswordEmail(to: string, link: string) {
    await this.transporter.sendMail({
      from: `"Soporte Inventario" <${process.env.EMAIL_USER}>`,
      to:to, // puede ser @gmail, @hotmail, @outlook, etc.
      subject: 'Restablecimiento de contraseña',
      html: `
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
        <a href="${link}" target="_blank">${link}</a>
        <p>Este enlace expirará en 15 minutos.</p>
      `,
    });
  }
}
