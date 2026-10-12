import prisma from '../config/prisma.js'
import { generateToken } from '../services/tokenService.js'
import { generateImage, embedToken } from '../services/imageService.js'
import { createHash, hkdfSync } from 'node:crypto'

//Clé principal de CerberKey, stockée dans .env
const masterKeyHex = process.env.CERBERKEY_MASTER_KEY
if(!masterKeyHex || !/^[0-9a-fA-F]{64}$/.test(masterKeyHex)) {
    throw new Error("CERBERKEY_MASTER_KEY must contain 64 hexadecimal characters")
}
const masterKey = Buffer.from(masterKeyHex, 'hex')
//Dérive une clé dédiée au chiffrement et au positionnement
const encryptionKey = Buffer.from(
    hkdfSync('sha256', masterKey, Buffer.alloc(0), 'cerberkey/aes/v1', 32)
)
const positionKey = Buffer.from(
    hkdfSync('sha256', masterKey, Buffer.alloc(0), 'cerberkey/positions/v1', 32)
)
export const startDemo = async (req, res) => {
    try {
       //1-Génére un token et son empreinte
       const { token, tokenHash } = generateToken()
       //2-Génére une image aléatoire
       const originalImage = await generateImage()
       //3-Génère et cache le token dans l'image | Pour l'instant une seule clé est utilisé
       const { image: securedImage, nonce } = await embedToken(
            originalImage,
            token,
            encryptionKey
       )
       //4-Crée une session temporaire dans PostgreSQL
       const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
       const session = await prisma.demoSession.create({
        data: {
            tokenHash,
            nonce,
            expiresAt
        }
       })
       //5-Renvoie les images sans exposer le token
       return res.status(201).json({
            message: "Demo session created successfully",
            sessionId: session.id,
            expiresAt: session.expiresAt,
            images: {
                secured: securedImage.toString('base64'),
                decoy: originalImage.toString('base64')
            }
       })
    } catch (error) {
        console.error("Demo session error", error)
        res.status(500).json({ message: "Error while creating demo session" })
    }
}