import {ITokensResponse} from "./tokens-response.interface";

export interface ITokens extends ITokensResponse {
    token: string;
    refreshToken: string;
    user: { $ref: string, $id: string };
}
