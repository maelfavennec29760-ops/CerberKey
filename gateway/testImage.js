
import { generateImage, embedToken, extractToken } from "./src/services/imageService.js";
import { generateToken } from "./src/services/tokenService.js";
import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";

try {
    // Génère une image aléatoire
    const originalImage = await generateImage();

    // Génère un token et une clé secrète
    const { token } = generateToken();
    const secretKey = randomBytes(32);

    // Insère le token dans l'image
    const { image, nonce } = await embedToken(
        originalImage,
        token,
        secretKey
    );

    // Enregistre les deux images
    await writeFile("test-original.png", originalImage);
    await writeFile("test-secured.png", image);

    // Extrait le token de l'image sécurisée
    const extractedToken = await extractToken(
        image,
        secretKey,
        nonce
    );

    // Vérifie que le token extrait est identique à l'original
    console.log("Token original :", token);
    console.log("Token extrait  :", extractedToken);
    console.log("Tokens identiques :", token === extractedToken);

} catch (error) {
    console.error("Image generation error:", error);
}
