import {HttpService} from "@nestjs/axios";
import {map, Observable} from "rxjs";
import {ConfigService} from "@nestjs/config";
import {Injectable} from "@nestjs/common";
@Injectable()
export class CaptchaService {
    constructor(private readonly httpService: HttpService,
                private config: ConfigService) {}

    check(token: string): Observable<boolean> {
        return this.httpService.get<{status: 'ok' | 'failed' | ''}>(`https://${this.config.get('YANDEX_URL')}/validate`, { params: {
                secret: this.config.get('YANDEX_SMARTCAPTCHA_SERVER_KEY'),
                token
            }}).pipe(map((res) => res?.data?.status === 'ok'
        ));
    }
}
