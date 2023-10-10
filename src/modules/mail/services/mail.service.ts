import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import {IMessagePayload} from "../interfaces/message.interface";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService, private config: ConfigService) {}

    async sendMessage(message: IMessagePayload) {
        await this.mailerService.sendMail({
            to: this.config.get('YANDEX_MAIL'),
            // from: '"Support Team" <support@example.com>', // override default from
            subject: message.subject,
            template: '../templates/confirmation', // `.hbs` extension is appended automatically
            context: { ...message },
        });
    }
}
