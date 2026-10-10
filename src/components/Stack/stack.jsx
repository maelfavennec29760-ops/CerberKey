
import { stack } from '../../data/stack.js';
import './stack.scss';

function TechStack() {
    return (
        <section className="techStack" id="technologies">
            <div className="techStackHeader">
                <span className="sectionLabel">
                    SOUS LE CAPOT
                </span>

                <h2>
                    TECHNO<span>LOGIES</span>
                </h2>

                <p>
                    Les technologies au cœur du système
                    d'authentification par image.
                </p>
            </div>

            <div className="techStackGrid">
                {stack.map((tech) => (
                    <a
                        href={tech.url || undefined}
                        className="techCard"
                        key={tech.id}
                        target={tech.url ? "_blank" : undefined}
                        rel={tech.url ? "noopener noreferrer" : undefined}
                    >
                        <img src={tech.logo} alt={tech.name} />
                        <h3>{tech.name}</h3>
                    </a>
                ))}
            </div>
        </section>
    );
}

export default TechStack;
