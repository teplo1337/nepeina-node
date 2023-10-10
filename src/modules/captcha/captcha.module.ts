import { Module } from '@nestjs/common';
import {HttpModule} from "@nestjs/axios";
import {CaptchaService} from "./services/captcha.service";

@Module({
    imports: [
        HttpModule,
    ],
    providers: [CaptchaService],
    exports: [CaptchaService]
})
export class CaptchaModule {}
