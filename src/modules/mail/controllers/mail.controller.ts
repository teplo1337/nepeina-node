import {Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Res} from "@nestjs/common";
import {IMessagePayload} from "../interfaces/message.interface";
import {MailService} from "../services/mail.service";
import {CaptchaService} from "../../captcha/services/captcha.service";
import {of, switchMap} from "rxjs";
import {Response} from "express";

@Controller('api/v1')
export class MailController {
    constructor(private mailService: MailService, private captchaService: CaptchaService) {
    }

    @Get('test')
    kek() {
        return 'api works';
    }

    @Post( 'message')
    @HttpCode(200)
    postMessage(@Body() body: IMessagePayload, @Res({passthrough: true}) res: Response) {
        return this.captchaService.check(body.token)
            .pipe(switchMap(result => result ?
                this.mailService.sendMessage(body) : res.status(403) &&
                of(new HttpException('Forbidden', HttpStatus.FORBIDDEN))));
    }
}
