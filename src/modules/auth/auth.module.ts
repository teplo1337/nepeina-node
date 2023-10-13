import { Module } from '@nestjs/common';
import {AuthService} from "./services/auth.service";
import {AuthController} from "./controllers/auth.controller";
import {MongoModule} from "../mongo/mongo.module";
import {NestjsFingerprintModule} from "nestjs-fingerprint";

@Module({
    providers: [AuthService],
    controllers: [AuthController],
    imports: [
        MongoModule,
        NestjsFingerprintModule.forRoot({
            params: ['userAgent', 'ipAddress'],
        }),
    ],
    exports: [AuthService]
})
export class AuthModule {}
