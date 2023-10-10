import { Injectable } from '@nestjs/common';
import {IMessagePayload} from "./modules/mail/interfaces/message.interface";

@Injectable()
export class AppService {
  getBlocks(): string {
    return 'Hello World!';
  }

  postMessage(body: IMessagePayload): string {
    return 'kek'
  }
}
