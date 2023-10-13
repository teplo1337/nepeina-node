import {RoleEnum} from "../enums/user-roles.enum";
import {Types} from "mongoose";

export interface IJwtPayload {
    roles: RoleEnum[];
    sub: Types.ObjectId;
}
