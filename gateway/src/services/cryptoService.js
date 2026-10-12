import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

//Algo de chiffrement
const ALGORITHM = "aes-256-gcm"
//Chiffre les données avec une clé AES de 32 octets
export const encryptToken = (token, secretKey) => {
    //Génère un IV aléatoire de 12 octects
    const iv = randomBytes(12)
    //Initialise le chiffrement
    const cipher = createCipheriv(ALGORITHM, secretKey, iv)
    //Chiffre le token
    const encrypted = Buffer.concat([
        cipher.update(token, 'utf-8'),
        cipher.final()
    ])
    //Récupere le tag d'authentification
    const authTag = cipher.getAuthTag()
    //Regroupe les données nécessaires au déchiffrement
    return Buffer.concat([
        iv,
        authTag,
        encrypted
    ])
}

//Déchiffre les données pour retrouver le token
export const decryptToken = (encryptPayload, secretKey) => {
    //Récupère les différentes parties
    const iv = encryptPayload.subarray(0, 12)
    const authTag = encryptPayload.subarray(12, 28)
    const encrypted = encryptPayload.subarray(28)
    //Initialise le déchiffrement
    const decipher = createDecipheriv(ALGORITHM, secretKey, iv)
    //Vérifie l'authenticité des données
    decipher.setAuthTag(authTag)
    //Déchiffre le token
    const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
    ])
    return decrypted.toString('utf-8')
}