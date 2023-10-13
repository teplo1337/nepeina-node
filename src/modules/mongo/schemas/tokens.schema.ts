import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import mongoose, {Types} from "mongoose";
import {UserSchema} from "./user.schema";

@Schema({validateBeforeSave: true})
export class Token {
    @Prop({
        required: true,
        type: String,
    })
    token: String;

    @Prop({
        required: true,
        type: String,
    })
    refreshToken: String;

    @Prop({
        required: true,
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    })
    user: any;

    @Prop({
        required: true,
        type: String,
    })
    fingerPrintHash: String
}
export const TokensSchema = SchemaFactory.createForClass(Token);
