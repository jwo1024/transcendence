import { config } from 'dotenv';
config({ path: '.env' });

export default {
    transport: {
      host: process.env.TFA_EMAIL_HOST,
      port: Number(process.env.TFA_EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.TFA_EMAIL_AUTH_USER,
        pass: process.env.TFA_EMAIL_AUTH_PASS
      }
    }
}