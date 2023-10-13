import { Injectable } from '@nestjs/common';
import {AuthService} from "../../auth/services/auth.service";
import {IFingerprint} from "nestjs-fingerprint";
import {catchError, from, map, Observable, switchMap} from "rxjs";
import * as fs from "fs";
import { promisify } from 'util';

@Injectable()
export class CmsService {
    private get writeFile() {
        return promisify(fs.writeFile);
    }
    private get readFile() {
        return promisify(fs.readFile);
    }
    private get unlink() {
        return promisify(fs.unlink);
    }

    private readonly path = 'json/blocks.json';
    constructor(private authService: AuthService) {}

    writeBlocks(data: JSON, token: string, fp: IFingerprint): Observable<any>{
        const path = this.path;
        return this.authService.verifyRequest(token?.split(' ')?.[1], fp)
            .pipe(switchMap((res) => {
                if (res) {
                    return this.readFile$(path)
                        .pipe(
                            switchMap(res => {
                                if (res) {
                                    console.log('file est');
                                    return this.deleteFile$(path)
                                        .pipe(map(_ => {throw new Error()}))
                                } else {
                                    throw new Error()
                                }
                            }),
                            catchError(err => this.writeFile$(data, path)
                                .pipe(map(_ => true)))
                        )
                } else {
                    throw new Error('Ошибка записи файла')
                }
            }));
    }

    private writeFile$(data: any, path: string): Observable<boolean> {
        return from(this.writeFile(path, JSON.stringify(data), 'utf8'))
            .pipe(map(_ => true));
    }

    private deleteFile$(path: string): Observable<boolean> {
        return from(this.unlink(path))
            .pipe(map(_ => true));
    }

    private readFile$(path: string): Observable<boolean> {
        return from(this.readFile(path))
            .pipe(map(_ => true));
    }

}
