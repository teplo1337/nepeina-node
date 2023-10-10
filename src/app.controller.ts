import {Body, Controller, Get, Post} from '@nestjs/common';
import { AppService } from './app.service';
import {IMessagePayload} from "./interfaces/message.interface";

@Controller('api/v1')
export class AppController {
  private api = 'api/v1/';
  constructor(private readonly appService: AppService) {}

  @Get( 'blocks')
  getBlocks(): string {
    return this.appService.getBlocks();
  }

  @Post( 'message')
  postMessage(@Body() body: IMessagePayload): string {
    return this.appService.postMessage(body);
  }
}
