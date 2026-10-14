import Github from '../../assets/logo/github.svg'
import Logo from '../../assets/logo/logoCerberKey.webp'
import './header.scss'

function Header() {
    return (
        <header>
            <div className="logo">
                <img src={Logo} alt="Logo CerberKey"/>
                <span className="logoName">Cerber<span className="logoKey">Key</span></span>
            </div>
            <div className="githubLink">
                <a href="https://github.com/maelfavennec29760-ops/CerbereKey.git" target="_blank" rel="noopener noreferrer">
                    <img src={Github} alt="Lien github"/>
                </a>
            </div>
        </header>
    )
}

export default Header