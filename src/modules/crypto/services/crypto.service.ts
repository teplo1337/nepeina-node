import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {from, Observable} from "rxjs";
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
    saltOrRounds: string | number = 10;

    constructor(private config: ConfigService) {
        console.log(bcrypt.compareSync('$2b$10$iCej6pmepwbkQ9dx0W7p5u1kmdd5vMHGNRZw7P7O2MSzodgZL942e', 'SuperPass123455'));
    }

    genHash(data: string): Observable<string> {
        return from(bcrypt.hash(data, this.saltOrRounds));
    }
    compareHash(data: string, encryptedData: string): Observable<boolean> {
        return from(bcrypt.compare(data, encryptedData));
    }

}
