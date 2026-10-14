import { sendFeedbackEmail } from "../services/emailService.js";

export const sendFeedback = async (req, res) => {
    try {
        const { name, comment } = req.body ?? {}
        if(typeof name !== 'string' || typeof comment !== 'string') {
            return res.status(400).json({ success: false, message: "Nom ou commentaire invalide." })
        }
        const cleanName = name.trim()
        const cleanComment = comment.trim()
        if(!cleanName || !cleanComment || cleanName.length > 80 || cleanComment.length > 2000) {
            return res.status(400).json({sucess: false, message: "Veuillez vérfier les champs du formulaire."})
        }
        await sendFeedbackEmail(cleanName, cleanComment)
        return res.status(200).json({ success: true, message: "Votre avis à bien été envoyé." })
    } catch (error) {
        console.error('Feedback error:', error)
        res.status(500).json({ success: false, message: "Impossible d'envoyez votre avis." })
    }
}