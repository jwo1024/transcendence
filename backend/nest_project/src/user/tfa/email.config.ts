import { ConfigService } from "@nestjs/config";
const env = new ConfigService();

export default {
    transport: {
      host: env.get<string>('TFA_EMAIL_HOST'),//'smtp.gmail.com',
      port: Number(env.get<string>('TFA_EMAIL_PORT')), // SMTP 포트 번호 (일반적으로 587 또는 465 사용)
      secure: false, // true이면 SSL을 사용
      auth: {
        user: env.get<string>('TFA_EMAIL_AUTH_USER'),
        pass: env.get<string>('TFA_EMAIL_AUTH_PASS'),
      }
    }
};