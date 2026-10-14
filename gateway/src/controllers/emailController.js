import { sendDemoImages } from "../services/emailService.js"


export async function sendDemoEmail(req, res) {
    try {
        const { email, securedImage, decoyImage } = req.body ?? {}
        if(typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof securedImage !== 'string' || typeof decoyImage !== 'string' || !securedImage || !decoyImage) {
            return res.status(400).json({ message: "Invalid email or missing images" })
        }
        const result = await sendDemoImages(email, securedImage, decoyImage)
        return res.status(200).json({ message: "Demo ZIP sent successfully", id: result.id })        
    } catch (error) {
        console.error("Demo mail error:", error)
        return res.status(500).json({ message: "Failed to send demo ZIP" })
    }
} 