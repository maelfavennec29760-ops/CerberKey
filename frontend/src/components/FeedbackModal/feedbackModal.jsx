import { useState } from 'react'
import { sendFeedback } from '../../services/sendFeedback.js'
import './feedbackModal.scss'

function FeedbackModal({ onClose }) {
    const [name, setName] = useState('')
    const [comment, setComment] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const handleSubmit =  async (e) => {
        e.preventDefault()
        if(!name.trim() || !comment.trim()) return
        setError('')
        setIsSending(true)
        try {
            await sendFeedback(name.trim(), comment.trim())
            setSuccess(true)
            setName('')
            setComment('')
        } catch (err) {
            setError("Impossible d'envoyer votre avis.")
        } finally {
            setIsSending(false)
        }
    }
    return (
        <div className="feedbackOverlay">
            <div className="feedbackModal" role="dialog" aria-modal="true" aria-labelledby="feedbackModalTitle">
                <button type="button" className="feedbackClose" onClick={onClose} aria-label="Fermer la fenêtre">
                    &times;
                </button>
                <div className="feedbackHeader">
                    <h2 id="feedbackModalTitle">
                        Donnez votre avis
                    </h2>
                    <p>
                        Vous avez testé CerberKey ?
                        Partagez vos impressions et suggestions.
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="feedbackField">
                        <label htmlFor="feedbackName">
                            Votre prénom / pseudo
                        </label>
                        <input id="feedbackName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Exemple : Paul Ochon" maxLength={80} required/>
                    </div>
                    <div className="feedbackField">
                        <label htmlFor="feedbackComment">
                            Votre commentaire
                        </label>
                        <textarea id="feedbackComment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Que pensez vous de CerberKey ? n'hésitez pas à émettre des suggestions d'amélioration" rows={5} maxLength={2000} required/>
                    </div>
                    {error && (
                        <p className="feedbackError" role="alert">
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className="feedbackSuccess" role="status">
                            Merci ! Votre avis à bien été envoyé.
                        </p>
                    )}
                    <button type="submit" className="feedbackSubmit" disabled={isSending || !name.trim() || !comment.trim()}>
                        {isSending ? 'Envoi en cours...'
                                   : success
                                   ? 'Avis envoyé'
                                   : 'Envoyé mon avis'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default FeedbackModal