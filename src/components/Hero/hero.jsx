import Cerbere from '../../assets/images/cerbere.webp'
import './hero.scss'

function Hero() {
    return (
        <section className="hero">
            <div className="heroContent">
                <p className="upText">AUTHENTIFICATION SÉCURISÉE</p>
                <h1>CONNECTEZ-VOUS
                    <span>AVEC UNE IMAGE</span>
                </h1>
                <p>
                    CerberKey est un système d'authentification
                    utilisant un token chiffré dissimulé dans
                    une image grâce à la stéganographie.
                </p>
                <div className="heroActions">
                    <button className="testCerberKey" onClick={() => 
                    document.getElementById("demo").scrollIntoView({
                        behavior: "smooth"
                    })
                }>Tester CerberKey</button>
                <a href="/documentation" className="heroDocumentation">
                    Documentation
                    <span aria-hidden="true">→</span>
                </a>
                </div>
            </div>
            <div className="heroImg">
                <img src={Cerbere} alt="Cerbère" />
            </div>
        </section>
    )
}

export default Hero