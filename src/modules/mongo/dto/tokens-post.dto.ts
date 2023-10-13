import {Types} from "mongoose";

export class TokenPostDTO {
    readonly token: string;
    readonly refreshToken: string;
    readonly user: Types.ObjectId;
    readonly fingerPrintHash: string;
}
