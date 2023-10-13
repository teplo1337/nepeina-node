import {RoleEnum} from "../enums/user-roles.enum";

export interface IUser extends Document {
    login: string;
    password: string;
    roles: RoleEnum[];
}

