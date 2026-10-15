import { useRef, useState } from 'react'
import { startDemo, verifyDemoImage } from '../../services/demoService.js'
import { SendDemoEmail } from '../../services/emailService.js'
import { downloadImages } from '../../utils/downloadImage.js'
import VerifyModal from '../VerifyModal/verifyModal.jsx'
import FeedbackModal from '../FeedbackModal/feedbackModal.jsx'
import './demo.scss'

function Demo() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [email, setEmail] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [emailSuccess, setEmailSuccess] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [isVerifying, setIsVerifying] = useState(false)
    const [verificationResult, setVerificationResult] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
    const fileInputRef = useRef(null)
    const handleDownload = async () => {
        setIsLoading(true)
        setError('')
        try {
            const data = await startDemo()
            await downloadImages(data.images)
        } catch (error) {
            console.error(error);
            setError("Unable to generate images. Please try again.");
        } finally {
            setIsLoading(false)
        }
    }
    const handleSendEmail = async () => {
        console.log('Bouton Recevoir déclenché')
        setIsSending(true)
        setError('')
        setEmailSuccess(false)
        try {
            const data = await startDemo()
            await SendDemoEmail(email, data.images)
            setEmailSuccess(true)
        } catch (error) {
            console.error(error)
            setError("Unable to send email. Please try again.")
        } finally {
            setIsSending(false)
        }
    }
    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if(!file) return
        if(file.type !== 'image/png') {
            setError("Only PNG images are supported")
            e.target.value = ''
            return
        }
        setSelectedImage(file)
        setError('')
        setVerificationResult(null)
    }
    const handleVerifyImage = async () => {
        if(isVerifying) return
        if(!selectedImage) {
            setError("Please select an image")
            return
        }
        setIsModalOpen(true)
        setIsVerifying(true)
        setError('')
        setVerificationResult(null)
        try {
            const result = await verifyDemoImage(selectedImage)
            setVerificationResult(result)
            console.log("Verification result:", result)
        } catch (error) {
            console.error(error)
            setError("Error while verifying the image")
        } finally {
            setIsVerifying(false)
        }
    }
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setSelectedImage(null)
        setVerificationResult(null)
        setError('')
        if(fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }
    const handleOpenFeedback = () => {
        handleCloseModal()
        setIsFeedbackOpen(true)
    }
     return (
        <section className="demo" id="demo">
            <div className="demoHeader">
                <p className="sectionLabel">DÉMONSTRATION</p>
                <h2>TESTER CERBER<span>KEY</span></h2>
                <p className="demoDescription">
                    Recevez deux images identiques en apprence.
                    Une seule contient votre clé d'authentification.
                </p>
            </div>
            <div className="demoContent">
                <div className="demoActions">
                    <form className="emailForm" onSubmit={(e) => {
                        e.preventDefault()
                        handleSendEmail()
                    }}>
                        <input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSending}/>
                        <button type="submit" disabled={isSending}>
                            {isSending ? "Envoie..." : "Recevoir"}
                        </button>
                    </form>
                    <span className="sperator">OU</span>
                    <button className="downloadButton" type="button" onClick={handleDownload} disabled={isLoading}>
                        {isLoading ? 'Génération...' : 'Télécharger les images'}
                    </button>
                </div>
                {emailSuccess && (
                    <p className="sucesssMessage"> Email envoyé ! Vérifiez votre boîte de réception.</p>
                )}
                {error && (
                    <p className="errorMessage">{error}</p>
                )}
                <div className="demoTest">
                    <div className="demoTestHeader">
                        <span>ÉTAPE SUIVANTE</span>
                        <h3>TESTEZ VOTRE IMAGE</h3>
                        <p>
                            Déposez l'une des deux images reçues pour tenter l'authentification.
                        </p>
                    </div>
                    <div className="uploadZone">
                        <label>
                            <input ref={fileInputRef} type="file" accept="image/png" onChange={handleImageChange} hidden/>
                            {selectedImage ? (
                                <>
                                    <div className="uploadSuccess">
                                        <span className="successIcon">✓</span>
                                            <p>Image chargée</p>
                                        
                                    </div>
                                    <span>Cliquer pour changer d'image</span>
                                </>
                            ) : (
                                <>
                                    <p>DÉPOSEZ VOTRE IMAGE</p>
                                    <span>Cliquez pour parcourir</span>
                                </>
                            )}
                        </label>
                    </div>
                    {selectedImage && (
                        <button type="button" className="verifyButton" onClick={handleVerifyImage} disabled={isVerifying}>
                            {isVerifying ? "Vérification" : "Vérifier mon image"}
                        </button>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <VerifyModal image={selectedImage} isVerifying={isVerifying} verificationResult={verificationResult} error={error} onClose={handleCloseModal} onFeedback={handleOpenFeedback}/>
            )}
            {isFeedbackOpen && (
                <FeedbackModal onClose={() => setIsFeedbackOpen(false)}/>
            )}
        </section>
    )
}

export default Demo