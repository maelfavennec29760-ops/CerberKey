import prisma from '../config/prisma.js'
import { extractToken } from '../services/imageService.js'
import { createHash, timingSafeEqual } from 'node:crypto'
import sharp from 'sharp'

export const verifyDemo = async (req, res) => {
    try {
        const { image } = req.body ?? {}
        //Récupèration l'image
        if(typeof image !== 'string' || !image.length) {
            return res.status(400).json({ message: "Missing or invalid image" })
        }
        //Vérification image Base64 et limitation de la taille de l'image à 5Mo
        const MAX_IMAGE_BYTES = 5 * 1024 * 1024
        if(image.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 || !/^[A-Za-z0-9+/]+={0,2}$/.test(image) || image.length % 4 !== 0) {
            return res.status(400).json({ message: "Invalid image format or size" })
        }
        //Conversion de l'image Base 64 en Buffer
        const imageBuffer = Buffer.from(image, 'base64')
        if(imageBuffer.length > MAX_IMAGE_BYTES || !imageBuffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
            return res.status(400).json({ message: "Only PNG images up to 5 MB are supported" })
        }
        //Vérification de la taille de l'image
        try {
            const metadata = await sharp(imageBuffer).metadata()
            if (!metadata.width || !metadata.height || metadata.width > 2048 || metadata.height > 2048) {
                return res.status(400).json({ message: "Image dimensions exceed the allowed limit" })
            }
        } catch (error) {
            console.error("PNG metadata error:", error)
            return res.status(400).json({ message: "Invalid PNG image" })
        }
        let extractedToken
        let sessionId
        try {
            const extracted = await extractToken(imageBuffer)
            extractedToken = extracted.token
            sessionId = extracted.sessionId
        } catch (error) {
            console.error("Token extraction error:", error.message)
            return res.status(200).json({ valid: false, message: "No valid token found in this image" })
        }
        //Recherche de la session
        const session = await prisma.demoSession.findUnique({
            where: {
                id: sessionId
            }
        })
        if(!session) {
            return res.status(200).json({ valid: false, message: "Demo session not found" })
        }
        //Vérification de l'expiration du token
        if(new Date() >= session.expiresAt) {
            return res.status(200).json({ valid: false, message: "Demo session expired" })
        }
        //Vérification de l'empreinte de la session
        if(typeof session.tokenHash !== 'string' || !/^[0-9a-fA-F]{64}$/.test(session.tokenHash)) {
            return res.status(200).json({ valid: false, message: "Invalid demo session" })
        }
        //Calcule l'empreinte du token extrait
        const extractedHash = createHash('sha256')
            .update(extractedToken)
            .digest()
        const storedHash = Buffer.from(session.tokenHash, 'hex')
        //Comparaison des empreintes
        const valid = timingSafeEqual(storedHash, extractedHash)
        return res.status(200).json({ valid, message: valid ? "Image authenticated successfully" : "Invalid image token" })
    } catch (error) {
        console.error("Demo verification error:", error)
        return res.status(500).json({ message: "Error while verifying demo image" })
    }
}