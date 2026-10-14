import prisma from '../config/prisma.js'
import { extractToken } from '../services/imageService.js'
import { createHash, hkdfSync, timingSafeEqual } from 'node:crypto'

const masterKeyHex = process.env.CERBERKEY_MASTER_KEY
if(!masterKeyHex || !/^[0-9a-fA-F]{64}$/.test(masterKeyHex)) {
    throw new Error("CERBERKEY_MASTER_KEY must contain 64 hexadecimal characters")
}
const masterKey = Buffer.from(masterKeyHex, 'hex')
const encryptionKey = Buffer.from(
    hkdfSync(
        'sha256',
        masterKey,
        Buffer.alloc(0),
        'cerberkey/aes/v1',
        32
    )
)
export const verifyDemo = async (req, res) => {
    try {
        const { sessionId, image } = req.body
        //Vérification des paramètres
        if(typeof sessionId !== 'string' || typeof image !== 'string') {
            return res.status(400).json({ message: "Missing or invalid sessionId or image" })
        }
        //Recherche de la session
        const session = await prisma.demoSession.findUnique({
            where: {id: sessionId}
        })
        if(!session) {
            return res.status(404).json({ valid: false, message: "Demo session not found" })
        }
        //Vérification de l'expiration
        if(new Date() >= session.expiresAt) {
            return res.status(200).json({ valid: false, message: "Demo session expired" })
        }
        //Conversion de l'image Base 64 en Buffer
        const imageBuffer = Buffer.from(image, 'base64')
        //Extraction du token
        let extractedToken
        try {
            extractedToken = await extractToken(
                imageBuffer,
                encryptionKey,
                session.nonce
            )
        } catch (error) {
            return res.status(200).json({ valid: false, message: "No valid token found in this image" })
        }
        //Calcul de l'empreinte du token extrait
        const extractedHash = createHash('sha256')
            .update(extractedToken)
            .digest()
        const storedHash = Buffer.from(session.tokenHash, 'hex')
        //Comparaison des empreintes
        const valid = storedHash.length === extractedHash.length && timingSafeEqual(storedHash, extractedHash)
        return res.status(200).json({ valid, message: valid ? "Image authenticated successfully" : "Invalid image token" })
    } catch (error) {
        console.error("Demo verification error:", error)
        return res.status(500).json({ message: "Error while verifying demo image" })
    }
}