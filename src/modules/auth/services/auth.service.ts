import { Injectable } from '@nestjs/common';
import {MongoService} from "../../mongo/services/mongo.service";
import {ICreateUser} from "../interfaces/create-user.interface";
import {Observable} from "rxjs";
import {ResponseInterface} from "../../mongo/interfaces/response.interface";
import {IUser} from "../../mongo/interfaces/user.interface";
import {ITokensResponse} from "../../mongo/interfaces/tokens-response.interface";
import {IFingerprint} from "nestjs-fingerprint";

@Injectable()
export class AuthService {
    constructor(private mongoService: MongoService) {}

    createUser(body: ICreateUser): Observable<ResponseInterface<any>> {
        return this.mongoService.createUser(body)
    }

    loginUser(body: IUser, fp: IFingerprint): Observable<ResponseInterface<ITokensResponse>> {
        return this.mongoService.createTokenByUserPassword(body, fp);
    }

    refreshToken(token: string, fp: IFingerprint): Observable<ResponseInterface<ITokensResponse>> {
        return this.mongoService.createTokenByRefreshToken(token, fp);
    }

    getUsers() {
        return this.mongoService.getUsers()
    }

    getTokens() {
        return this.mongoService.getTokens()
    }

    verifyRequest(token: string, fp: IFingerprint) {
        return this.mongoService.verifyRequest(token, fp);
    }

}
