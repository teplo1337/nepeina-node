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

@Injectable()
export class MongoService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<IUser>,
        @InjectModel('Tokens') private readonly tokensModel: Model<ITokens>,
        private jwtService: JwtService,
        private cryptoService: CryptoService
    ) {}

    createUser(userPostDTO: UserPostDTO): Observable<ResponseInterface<any>> {
        return from(new this.userModel(userPostDTO).save())
            .pipe(
                catchError(({_message}) => {
                    console.log(_message)
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

    createTokenByUserPassword(u: UserPostDTO, fp: IFingerprint): Observable<any> {
        return from(this.userModel.findOne<Document & IUser>({login: u.login, password: u.password})
            .exec()).pipe(
                switchMap((user) => {
                    if (!user) {
                        throw new Error('Неправильный пользователь или пароль');
                    }

                    const payload: IJwtPayload = {
                        sub: user._id,
                        roles: user.roles
                    };

                    return this.cryptoService.genHash(fp)
                        .pipe(map((fingerPrintHash => {
                            const tokenPostDTO: TokenPostDTO = {
                                token: this.jwtService.sign(payload, {expiresIn: '1h'}),
                                refreshToken: this.jwtService.sign(payload, {expiresIn: '1h'}),
                                fingerPrintHash,
                                user: user._id
                            };

                            return tokenPostDTO;

                        })))
                }),
                switchMap((tokenPostDTO) => {
                    return from(this.tokensModel.deleteMany({user: tokenPostDTO.user}).exec())
                        .pipe(
                            switchMap(_ =>  from(new this.tokensModel(tokenPostDTO).save())),
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
                })
        )
    }

    createTokenByRefreshToken(refreshToken: string, fp: IFingerprint): Observable<any> {
        return forkJoin([
            this.cryptoService.genHash(fp),
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
            this.cryptoService.genHash(fp),
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
