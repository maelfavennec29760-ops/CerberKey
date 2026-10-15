import prisma from '../config/prisma.js'
import { generateToken } from '../services/tokenService.js'
import { generateImage, embedToken } from '../services/imageService.js'

export const startDemo = async (req, res) => {
    let session = null
    try {
       const { token, tokenHash } = generateToken()
       const expiresAt = new Date(Date.now() + 15 * 60* 1000)
       session = await prisma.demoSession.create({
            data: {
                tokenHash,
                expiresAt
            }
       })
       const originalImage = await generateImage()
       const { image: securedImage, nonce } = await embedToken(
            originalImage,
            token,
            session.id
       )
       await prisma.demoSession.update({
        where: {
            id: session.id,
        },
        data:{
            nonce
        }
       })
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
        if(session) {
            try {
                await prisma.demoSession.delete({
                    where: {
                        id: session.id
                    }
                })
            } catch (cleanupError) {
                console.error("Session cleanup error:", cleanupError)
            }
        }
        return res.status(500).json({ message: "Error while creating demo session" })
    }
}