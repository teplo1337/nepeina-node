import {Body, Controller, Get, HttpException, HttpStatus, Post} from "@nestjs/common";
import {IMessagePayload} from "../interfaces/message.interface";
import {MailService} from "../services/mail.service";
import {CaptchaService} from "../../captcha/services/captcha.service";
import {of, switchMap, throwError} from "rxjs";

@Controller('api/v1')
export class MailController {
    constructor(private mailService: MailService, private captchaService: CaptchaService) {
    }

    @Get('test')
    kek() {
        return 'api works';
    }

    @Post( 'message')
    postMessage(@Body() body: IMessagePayload) {
        return this.captchaService.check(body.token)
            .pipe(switchMap(result => result ?
                this.mailService.sendMessage(body) :
                of(new HttpException('Forbidden', HttpStatus.FORBIDDEN))));
    }
}
