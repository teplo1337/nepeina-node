import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {Global, Module} from '@nestjs/common';
import { join } from 'path';
import {MailService} from "./services/mail.service";
import {ConfigService} from "@nestjs/config";
import {MailController} from "./controllers/mail.controller";
import {CaptchaModule} from "../captcha/captcha.module";

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      // imports: [ConfigModule], // import module if not enabled globally
      useFactory: async (config: ConfigService) => ({
        // transport: config.get("MAIL_TRANSPORT"),
        // or
        transport: {
          host: config.get('MAIL_HOST'),
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: `"Сообщение сгенерировано автоматически" <${config.get('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    CaptchaModule
  ],
  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],

})
export class MailModule {}
