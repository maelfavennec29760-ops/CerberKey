import './howItWorks.scss'

function HowItWorks() {
    return (
        <section className="howItWorks" id="howItWorks">
            <div className="howItWorksHeader">
                <h2>COMMENT ÇA <span>MARCHE ?</span></h2>
                <p>Une image. Un token. Trois couches</p>
                <div className="scrollIndicator">
                    <span></span>
                </div>
            </div>
            <div className="howItWorksSteps">
                <div className="step">
                    <span className="stepNumber">01</span>
                    <h3>IMAGE TOKEN</h3>
                    <p>Un token chiffré est dissimulé dans l'image.</p>
                </div>
                <div className="step">
                    <span className="stepNumber">02</span>
                    <h3>EXTRACTION</h3>
                    <p>Le token est extrait dans l'image.</p>
                </div>
                <div className="step">
                    <span className="stepNumber">03</span>
                    <h3>DÉCHIFFREMENT</h3>
                    <p>Le token est déchiffré.</p>
                </div>
                <div className="step">
                    <span className="stepNumber">04</span>
                    <h3>VÉRIFICATION</h3>
                    <p>Le token est vérifier avant d'autoriser l'accès.</p>
                </div>
            </div>
        </section>
    )
}

export default HowItWorks