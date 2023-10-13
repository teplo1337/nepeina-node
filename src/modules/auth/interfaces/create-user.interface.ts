import {RoleEnum} from "../../mongo/enums/user-roles.enum";

export interface ICreateUser {
    login: string;
    password: string;
    roles: RoleEnum[]
}

