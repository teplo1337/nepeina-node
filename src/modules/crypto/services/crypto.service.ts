import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {from, Observable} from "rxjs";
import * as bcrypt from 'bcrypt';
import {IFingerprint} from "nestjs-fingerprint";

@Injectable()
export class CryptoService {
    saltOrRounds: string | number = 10;

    constructor(private config: ConfigService) {
        bcrypt.genSalt(15).then(res => this.saltOrRounds = res);
    }

    genHash(fp: IFingerprint): Observable<string> {
        return from(bcrypt.hash(JSON.stringify(fp), this.saltOrRounds));
    }

    genHash2(fp: IFingerprint) {
        return bcrypt.hash(JSON.stringify(fp), this.saltOrRounds);
    }
}
