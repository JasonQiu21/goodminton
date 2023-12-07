import { getPlayerByEmail } from "../data/players.js";
import * as typecheck from "../typecheck.js";

export const loginUser = async(email, password) => {
    email = typecheck.checkEmail(email);
    password = typecheck.isValidString(password);
    
};