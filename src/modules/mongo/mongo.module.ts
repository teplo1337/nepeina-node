import { Module } from '@nestjs/common';
import {MongoService} from "./services/mongo.service";
import {MongooseModule} from "@nestjs/mongoose";
import {UserSchema} from "./schemas/user.schema";
import {TokensSchema} from "./schemas/tokens.schema";
import {JwtModule} from "@nestjs/jwt";
import {ConfigService} from "@nestjs/config";
import {config} from "rxjs";
import {CryptoModule} from "../crypto/crypto.module";

@Module({
    providers: [MongoService],
    imports: [
        MongooseModule.forRoot('mongodb://root:SpaceCrab123@nepeina.ru:27017/'),
        MongooseModule.forFeature([
            { name: 'User', schema: UserSchema },
            { name: 'Tokens', schema: TokensSchema },
        ]),
        JwtModule.registerAsync({
            useFactory: async (config: ConfigService) => ({
                global: true,
                secret: config.get('TOKEN_SECRET'),
                signOptions: { expiresIn: '60s' },
                algorithms: "HS256"
            }),
            inject: [ConfigService]
        }),
        CryptoModule
    ],
    exports: [MongoService]
})
export class MongoModule {}
