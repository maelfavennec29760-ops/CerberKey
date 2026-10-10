import './demo.scss'

function Demo() {
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
                    <div className="emailForm">
                        <input type="email" placeholder="votre@email.com"/>
                        <button type="button">
                            Recevoir
                        </button>
                    </div>
                    <span className="sperator">OU</span>
                    <button className="downloadButton" type="button">
                        Télécharger les images
                    </button>
                </div>
                <div className="demoTest">
                    <div className="demoTestHeader">
                        <span>ÉTAPE SUIVANTE</span>
                        <h3>TESTEZ VOTRE IMAGE</h3>
                        <p>
                            Déposez l'une des deux images reçues pour tenter l'authentification.
                        </p>
                    </div>
                    <div className="uploadZone">
                        <p>DÉPOSEZ VOTRE IMAGE</p>
                        <span>ou cliquez pour parcourir</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Demo