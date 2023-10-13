import { Module } from '@nestjs/common';
import {CmsService} from "./services/cms.service";
import {CmsController} from "./controllers/cms.controller";
import {AuthModule} from "../auth/auth.module";

@Module({
    providers: [CmsService],
    controllers: [CmsController],
    imports: [
        AuthModule,
    ]
})
export class CmsModule {}
