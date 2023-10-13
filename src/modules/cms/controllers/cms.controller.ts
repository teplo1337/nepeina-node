import {Body, Controller, HttpCode, HttpException, HttpStatus, Headers, Post, Res} from "@nestjs/common";
import {CmsService} from "../services/cms.service";
import {Fingerprint, IFingerprint} from "nestjs-fingerprint";
import {catchError, of, switchMap, throwError} from "rxjs";
import {Response} from "express";

@Controller('api/v1')
export class CmsController {
    constructor(private cmsService: CmsService) { }


    @Post( 'blocks')
    @HttpCode(200)
    auth(
        @Body() body: any,
        @Res({passthrough: true}) res: Response,
        @Fingerprint() fp: IFingerprint,
        @Headers('Authorization') auth: string
    ) {
        return this.cmsService.writeBlocks(body, auth, fp)
            .pipe(
                catchError(_ => of(false)),
                switchMap(result =>
                 result ?
                    of({
                        success: true,
                    }) : res.status(HttpStatus.BAD_REQUEST) &&
                    of(new HttpException('', HttpStatus.BAD_REQUEST))
                ),
            );
    }
}
