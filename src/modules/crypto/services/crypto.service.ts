import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {from, Observable} from "rxjs";
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
    saltOrRounds: string | number = 10;

    constructor(private config: ConfigService) {
        bcrypt.genSalt(15).then(res => this.saltOrRounds = res);
    }

    genHash(data: string): Observable<string> {
        return from(bcrypt.hash(data, this.saltOrRounds));
    }
}
