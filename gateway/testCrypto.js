
import { randomBytes } from "node:crypto";
import { generateToken } from "./src/services/tokenService.js";
import { encryptToken, decryptToken } from "./src/services/cryptoService.js";

try {
    // Génère une clé AES-256
    const secretKey = randomBytes(32);

    // Génère un token
    const { token } = generateToken();

    // Chiffre le token
    const encryptedToken = encryptToken(token, secretKey);

    // Déchiffre le token
    const decryptedToken = decryptToken(encryptedToken, secretKey);

    console.log("Token original :", token);
    console.log("Token chiffré :", encryptedToken.toString("hex"));
    console.log("Token déchiffré :", decryptedToken);
    console.log("Tokens identiques :", token === decryptedToken);

} catch (error) {
    console.error("Crypto error :", error);
}
