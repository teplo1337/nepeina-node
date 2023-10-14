import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {IUser} from "../interfaces/user.interface";
import {Document, Model,} from "mongoose";
import {ITokens} from "../interfaces/tokens.interface";
import {UserPostDTO} from "../dto/user-post.dto.";
import {catchError, forkJoin, from, map, Observable, of, switchMap} from "rxjs";
import {ResponseInterface} from "../interfaces/response.interface";
import {TokenPostDTO} from "../dto/tokens-post.dto";
import {JwtService} from "@nestjs/jwt";
import {IJwtPayload} from "../interfaces/jwt-payload.interface";
import {IFingerprint} from "nestjs-fingerprint";
import {CryptoService} from "../../crypto/services/crypto.service";
import {ConfigService} from "@nestjs/config";
import {IAuthPayload} from "../../auth/interfaces/auth.interface";

@Injectable()
export class MongoService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        @InjectModel('Tokens') private readonly tokensModel: Model<ITokens>,
        private jwtService: JwtService,
        private cryptoService: CryptoService,
        private config: ConfigService
    ) {}

    createUser(userPostDTO: UserPostDTO): Observable<ResponseInterface<any>> {
        return this.hashUserCredentials(userPostDTO).pipe(
            switchMap(hashedCredentials =>
                from(new this.userModel(hashedCredentials).save())),
                catchError(({_message}) => {
                    return of( {
                        success: false,
                        message: _message
                    });
                }),
                map((res: any) => {
                    return res.success === false ? res : {
                        success: true,
                        message: 'Пользователь зарегистрирован'
                    }
                })
            )
    }

    createTokenByUserPassword(authPayload: IAuthPayload, fp: IFingerprint): Observable<any> {
        return this.hashUserCredentials<IAuthPayload>(authPayload)
            .pipe(
                switchMap(hashedCredentials =>
                    from(this.userModel.findOne<Document & IUser>({login: hashedCredentials.login, password: hashedCredentials.password})
                        .exec())),
                switchMap(user => {
                    if (!user) {
                        throw new Error('Неправильный пользователь или пароль');
                    }

                    const payload: IJwtPayload = {
                        sub: user._id,
                        roles: user.roles
                    };

                    return this.cryptoService.genHash(JSON.stringify(fp))
                        .pipe(map((fingerPrintHash => {
                            const tokenPostDTO: TokenPostDTO = {
                                token: this.jwtService.sign(payload, {expiresIn: this.config.get('TOKEN_TIME')}),
                                refreshToken: this.jwtService.sign(payload, {expiresIn: this.config.get('REFRESH_TOKEN_TIME')}),
                                fingerPrintHash,
                                user: user._id
                            };

                            return tokenPostDTO;

                        })))
                }),
                switchMap(tokenPostDTO => from(this.tokensModel.deleteMany({user: tokenPostDTO.user}).exec()).pipe(map(_ => tokenPostDTO))),
                switchMap(tokenPostDTO =>  from(new this.tokensModel(tokenPostDTO).save())),
                catchError(({_message}) => {
                    return of( {
                        success: false,
                        message: _message
                    });
                }),
                map((res: any) => {
                    return res.success === false ? res : {
                        success: true,
                        message: '',
                        data: {
                            token: res.token,
                            refreshToken: res.refreshToken
                        }
                    }
                })
            );
    }

    hashUserCredentials<T extends  IAuthPayload>(credentials: T): Observable<T> {
        return forkJoin([
            this.cryptoService.genHash(credentials.login),
            this.cryptoService.genHash(credentials.password)]
        )
            .pipe(map(([login, password]) => ({
                ...credentials,
                login,
                password
            })));
    }

    createTokenByRefreshToken(refreshToken: string, fp: IFingerprint): Observable<any> {
        return forkJoin([
            this.cryptoService.genHash(JSON.stringify(fp)),
            from(this.jwtService.verifyAsync(refreshToken, {algorithms: ['HS256']})),
        ])
            .pipe(
                switchMap(([fingerPrintHash, tokenData]) =>
                    from(this.tokensModel
                        .updateOne({ refreshToken, fingerPrintHash }, {
                            $set: { token: this.jwtService.sign({ sub: tokenData.sub, roles: tokenData.roles }) }
                        }).findOne({ refreshToken }))
                ),

                map(data => ({
                   success: true,
                   data: {
                       token: data.token
                   }
                })),

                catchError(message => {
                    return of( {
                        success: false,
                        message
                    });
                })
            );
    }

    public verifyRequest(token: string, fp: IFingerprint): Observable<boolean> {

        return forkJoin([
            this.cryptoService.genHash(JSON.stringify(fp)),
            from(this.jwtService.verifyAsync(token, {algorithms: ['HS256']})).pipe(map(v => !!v)),
        ]).pipe(
            switchMap(([fingerPrintHash,tokenValid]) =>
            {
                if (!tokenValid) {
                    throw new Error('invalid token');
                }

                return from(this.tokensModel
                    .findOne({ token, fingerPrintHash }))
            }
            ),
            map(res => {
                console.log('check status', res);

                return !!res._id;
            }),
            catchError(message => {
                return of( false);
            })
        )
    }

    async getTokens(): Promise<ITokens[]> {
        return await this.tokensModel.find().exec();;
    }

    async getUsers(): Promise<IUser[]> {
        return await this.userModel.find().exec();
    }
}
