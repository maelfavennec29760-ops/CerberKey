import './footer.scss'

function Footer() {
    return (
        <footer className="footer">
            <div className="footerContent">
                <p>© {new Date().getFullYear()} CerberKey — Projet expérimental</p>
                <div className="footerLinks">
                    <a href="https://github.com/maelfavennec29760-ops/CerbereKey.git" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href="">Documentation</a>
                </div>
            </div>
        </footer>
    )
}

export default Footer