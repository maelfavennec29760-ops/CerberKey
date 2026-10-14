import { verificationSteps } from '../../data/steps.js'
import { useEffect, useState } from 'react'
import './verifyModal.scss'

function VerifyModal({ image, onClose, isVerifying, verificationResult, error }) {
    const [preview, setPreview] = useState(null)
    const [visibleStep, setVisibleStep] = useState(0)
    useEffect(() => {
        if(!image) return
        const imageUrl = URL.createObjectURL(image)
        setPreview(imageUrl)
        return () => URL.revokeObjectURL(imageUrl)
    }, [image])
    useEffect(() => {
        if(isVerifying || !verificationResult) return
        const timers = verificationSteps.map((step, index) => {
            return setTimeout(() => {
                setVisibleStep(index + 1)
            }, (index + 1) * 600)
        })
        return () => {
            timers.forEach(clearTimeout)
        }
    }, [isVerifying, verificationResult])
    const isAnimationFinished = visibleStep ===  verificationSteps.length
    const isSuccess = isAnimationFinished && verificationResult?.valid === true
    const isFailure = isAnimationFinished && verificationResult?.valid === false
    const isError = Boolean(error) && !isVerifying
    return (
        <div className="modalOverlay">
            <div className="verifyModal" role="dialog" aria-modal="true" aria-labelledby="verifyModalTitle">
                <button type="button" className="modalClose" onClick={onClose} aria-label="Fermer la fenêtre">
                    &times;
                </button>
                <div className="modalHeader">
                    <h2 className="verifyModalTitle">Vérification de votre image</h2>
                    <p>Suivez les différentes étape du processus
                       d'authentification
                    </p>
                </div>
                <div className="modalContent">
                    <div className="modalPreview">
                        <div className="previewImage">
                            {preview && (
                                <img src={preview} alt="Aperçu de l'image sélectionnée" />
                            )}
                        </div>
                        <p>{image?.name}</p>
                        <span>Aperçu de l'image</span>
                    </div>
                    <div className="modalSteps">
                        {verificationSteps.map((step, index) => {
                            const isCompleted = index < visibleStep
                            const isRejected = 
                                    isCompleted &&
                                    index === verificationSteps.length - 1 &&
                                    verificationResult?.valid === false
                            return (
                                <div className="modalStep" key={step.id}>
                                    <div className={`stepIndicator ${
                                        isCompleted
                                            ? isRejected ? 'rejected' : 'completed'
                                            : ''
                                    }`}>
                                        {isCompleted && (isRejected ? "✕" : "✓")}
                                    </div>
                                    <div className="stepContent">
                                        <h3>{step.title}</h3>
                                        <p>{step.description}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className={`modalResult ${isSuccess ? 'success' : isFailure || isError ? 'failure' : ''}`} role="status" aria-live="polite">
                    <div className="resultIndicator">
                        {isSuccess ? '✓' : isFailure || isError ? '✕' : ''}
                    </div>
                        <h3>
                            {isSuccess
                                ? 'Authentification réussie'
                                : isFailure
                                    ? 'Authentification refusée'
                                    : isError
                                        ? 'Erreur de vérification'
                                        : 'Vérification en cours...'    
                            }
                        </h3>
                        <p>
                            {isSuccess
                                ? 'Votre image à été authentifiée avec succès.'
                                : isFailure
                                    ? "Le token de cette image n'a pas été reconnu."
                                    : isError
                                        ? error
                                        : "Veuillez patienter pendant l'authentification de votre image."
                            }
                        </p>
                </div>
                <div className="modalFeedback">
                    <p>Vous avez des suggestion pour améliorer CerberKey</p>
                    <button type="button" className="feedbackButton" disabled>
                        Donnez mon avis
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VerifyModal
