import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MailModule} from "./modules/mail/mail.module";
import {ConfigModule} from "@nestjs/config";
import {AuthModule} from "./modules/auth/auth.module";
import {CmsModule} from "./modules/cms/cms.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "environments/.env",
      isGlobal: true, // no need to import into other modules
    }),
    MailModule,
    AuthModule,
    CmsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
