import {Body, Controller, HttpCode, HttpException, HttpStatus, Post, Res} from "@nestjs/common";
import {AuthService} from "../services/auth.service";
import {Response} from "express";
import {ICreateUser} from "../interfaces/create-user.interface";
import {of, switchMap} from "rxjs";
import {IUser} from "../../mongo/interfaces/user.interface";
import {Fingerprint, IFingerprint} from "nestjs-fingerprint";

@Controller('api/v1')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post( 'create')
    @HttpCode(200)
    create(@Body() body: ICreateUser, @Res({passthrough: true}) res: Response) {
        return this.authService.createUser(body)
            .pipe(switchMap(result => {
                return result.success ?
                    of(result) : res.status(HttpStatus.BAD_REQUEST) &&
                    of(new HttpException(result.message, HttpStatus.BAD_REQUEST))
            }));
    }

    // @Post( 'users/all')
    @HttpCode(200)
    userAll() {
        return this.authService.getUsers();
    }

    @Post( 'tokens/all')
    @HttpCode(200)
    tokensAll() {
        return this.authService.getTokens();
    }

    @Post( 'auth')
    @HttpCode(200)
    auth(
        @Body() body: IUser,
        @Res({passthrough: true}) res: Response,
        @Fingerprint() fp: IFingerprint
    ) {
        return this.authService.loginUser(body, fp)
            .pipe(switchMap(result => {
                return result.success ?
                    of(result) : res.status(HttpStatus.BAD_REQUEST) &&
                    of(new HttpException(result.message, HttpStatus.BAD_REQUEST))
            }));
    }

    @Post( 'refresh')
    @HttpCode(200)
    refresh(
        @Body() body: { refreshToken: string },
        @Res({passthrough: true}) res: Response,
        @Fingerprint() fp: IFingerprint
    ) {
        return this.authService.refreshToken(body.refreshToken, fp)
            .pipe(switchMap(result => {
                return result.success ?
                    of(result) : res.status(HttpStatus.BAD_REQUEST) &&
                    of(new HttpException(result.message, HttpStatus.BAD_REQUEST))
            }));
    }
}
