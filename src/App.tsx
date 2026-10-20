import { Icon } from './components/Icon';
import { InkCanvas } from './components/InkCanvas';
import { ProjectNotes } from './components/ProjectNotes';
import { experience, profile, projects, skills } from './data/portfolio';

export default function App() {
  return (
    <>
      <InkCanvas />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="page-shell relative z-10 mx-auto">
        <header className="site-header flex flex-wrap items-center justify-between gap-x-6">
          <a
            className="home-link"
            href="#top"
            aria-label="Galileo Kim, back to top"
          >
            Galileo Kim
          </a>
          <nav
            aria-label="Main navigation"
            className="flex items-center gap-1 sm:gap-4"
          >
            <a href="#projects">Projects</a>
            <a href="#experience">Experience</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
        </header>

        <main id="main" tabIndex={-1}>
          <section className="intro" id="top" aria-labelledby="intro-title">
            <h1 id="intro-title">Galileo Kim</h1>
            <p className="intro-lead">
              Computer Science student at the University of British Columbia.
            </p>
            <p className="intro-description">
              I develop web and iOS applications and contribute to pro bono
              projects with Motion UBC.
            </p>
            <div className="social-links flex flex-wrap items-center gap-x-5 gap-y-1">
              <a href={profile.github} target="_blank" rel="noreferrer">
                <Icon name="github" />
                GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer">
                <Icon name="linkedin" />
                LinkedIn<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a href={`mailto:${profile.email}`}>
                <Icon name="mail" />
                Email
              </a>
            </div>
          </section>

          <section
            id="projects"
            className="content-section"
            aria-labelledby="projects-title"
          >
            <div className="section-heading">
              <h2 id="projects-title">Projects</h2>
            </div>
            <div className="project-list grid gap-4">
              {projects.map((project, index) => (
                <article
                  className={`project-card ${index === 0 ? 'project-featured' : ''}`}
                  key={project.id}
                >
                  <div className="project-heading">
                    <p className="project-category">{project.category}</p>
                    <h3>{project.name}</h3>
                    <p className="project-date">{project.date}</p>
                  </div>
                  <div className="project-body">
                    <p className="project-description">{project.description}</p>
                    <ul
                      className="technology-list flex flex-wrap"
                      aria-label={`${project.name} technologies`}
                    >
                      {project.technologies.map((technology) => (
                        <li key={technology}>{technology}</li>
                      ))}
                    </ul>
                    <ProjectNotes name={project.name} notes={project.notes} />
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            id="experience"
            className="content-section"
            aria-labelledby="experience-title"
          >
            <div className="section-heading">
              <h2 id="experience-title">Work experience</h2>
            </div>
            <div className="experience-list">
              {experience.map((item) => (
                <article className="experience-row" key={item.organization}>
                  <div className="experience-meta">
                    <p>{item.dates}</p>
                    <p>{item.location}</p>
                  </div>
                  <div>
                    <h3>{item.organization}</h3>
                    <p className="role">{item.role}</p>
                    <p className="body-copy">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            id="about"
            className="content-section"
            aria-labelledby="about-title"
          >
            <div className="section-heading">
              <h2 id="about-title">Education &amp; extracurriculars</h2>
            </div>
            <div className="about-grid grid gap-8 md:grid-cols-2 md:gap-12">
              <article>
                <h3>Education</h3>
                <p className="body-copy">
                  B.Sc. in Computer Science, University of British Columbia,
                  Vancouver. Expected graduation: April 2029.
                </p>
                <p className="small-note">GPA: 92.7%</p>
                <p className="body-copy">
                  Hackathons: nwHacks, Journey Hacks, Hack Camp, and Silly Hacks
                  (winner, <strong>CSSS Rube Goldberg Track</strong>).
                </p>
              </article>
              <article>
                <h3>Volunteer experience</h3>
                <p className="body-copy">
                  With Motion UBC, I develop pro bono web applications for
                  S.U.C.C.E.S.S., including tools for volunteers to view and
                  manage their bookings.
                </p>
                <p className="small-note">
                  Software Developer · Nov. 2025 – present
                </p>
              </article>
            </div>
            <div className="toolbox">
              <h3>Technical skills</h3>
              <dl>
                {skills.map((skill) => (
                  <div className="skill-row" key={skill.label}>
                    <dt>{skill.label}</dt>
                    <dd>{skill.items}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section
            id="contact"
            className="contact-section"
            aria-labelledby="contact-title"
          >
            <h2 id="contact-title">Contact</h2>
            <a className="contact-email" href={`mailto:${profile.email}`}>
              {profile.email}
              <Icon name="arrow" />
            </a>
          </section>
        </main>

        <footer className="site-footer flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p>Galileo Kim</p>
          <a href="#top">
            Back to top <Icon name="up" />
          </a>
        </footer>
      </div>
    </>
  );
}
