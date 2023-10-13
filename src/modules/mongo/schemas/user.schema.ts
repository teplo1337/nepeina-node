import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {RoleEnum} from "../enums/user-roles.enum";

@Schema({validateBeforeSave: true})
export class User {
    @Prop({
        required: true,
        type: String,
        validate: {
            validator: (value) => Promise.resolve(value?.length > 4),
            message: 'Login validation failed: length should be longer than 4'
        }
    })
    login: String;

    @Prop({
        required: true,
        type: String,
        validate: {
            validator: (value) => Promise.resolve(value.length > 4),
            message: 'Password validation failed: length should be longer than 4'
        }
    })
    password: String;

    @Prop({
        required: true,
        type: [String],
        enum: [RoleEnum.ROLE_ADMIN, RoleEnum.ROLE_GUEST],
        validate: {
            validator: (value) => Promise.resolve(value?.length && value.every(v => RoleEnum[v])),
            message: 'Roles validation failed'
        }
    })
    roles: Array<String>;
}
export const UserSchema = SchemaFactory.createForClass(User);
