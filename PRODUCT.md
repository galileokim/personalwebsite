# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite with React and Tailwind CSS, chosen by Galileo. The implementation uses TypeScript and produces a static build in `dist/`. Hosting and domain are undecided.

## Users

Visitors who want to learn about Galileo Kim's background as a student, see his projects, and understand his extracurricular involvement. Galileo has not specified a narrower primary audience.

## Product Purpose

A personal website for Galileo Kim. Visitors should be able to understand his education and experience, review his technical projects, and learn about his volunteer work and hackathon participation.

Success means visitors can find and understand this information without the background effect competing for their attention.

## Operating Context

Galileo supplied his résumé as the source for website content. A Markdown transcription lives at `content/resume.md`, including his education, skills, experience, projects, volunteer work, hackathons, and contact details.

The site presents Galileo's work. The capabilities described in his projects belong to those projects, not to the personal website itself.

## Capabilities and Constraints

- Present Galileo's student background, projects, and extracurricular information using the supplied résumé.
- Include a cursor-driven trail that resembles ink dispersing in water. Keep its movement calm and wispy, with soft edges and no edge-contrast boost. Do not show an ink button, status label, or explanation.
- Keep the effect behind the text and content cards. It must remain less prominent than the content.
- Preserve the names, dates, technologies, and accomplishments from the résumé when adapting the text. Do not invent additional experience, project URLs, availability for work, or claims.
- Treat résumé metrics as owner-supplied claims, not independently verified benchmarks. Preserve their qualifications, including `30+`, `100+`, and expected graduation.

Open decisions:

- Hosting provider and domain.
- Individual project repository links, live demos, screenshots, and any additional extracurricular content.
- Whether to display the résumé's phone number on the public website.
- Whether to offer a downloadable résumé; no PDF has been supplied.

## Brand Commitments

- Public name: Galileo Kim.
- Use Keyline Icons, stroke variant.
- Use direct, factual wording. Section labels should describe their contents, such as Projects, Work experience, and Education & extracurriculars. Do not add metaphorical headings, personal taglines, or filler copy.
- Galileo describes the concept as an empty canvas that someone can move an ink waterbrush across.
- The background should be white/grey.
- Text and content cards must take visual priority over the cursor effect and background. Galileo suggested slight blur or a greyed-out treatment as possible ways to keep the effect subdued; the exact treatment is undecided.
- Cursor-effect reference: https://codepen.io/Yakudoo/pen/bGOMJPw.
- Website-design reference: https://kdrag0n.dev/.

These are owner-supplied constraints and references, not a completed visual design. The references have not been inspected during init, and no third-party code or assets have been copied.

## Evidence on Hand

- `content/resume.md`: transcription of the LaTeX résumé Galileo supplied in the initialization conversation. It records UBC education, UBC and Apple experience, four technical projects, Motion UBC volunteering, technical skills, and hackathon participation.
- Owner-supplied email: galileokim451@gmail.com.
- Owner-supplied GitHub profile: https://github.com/galileokim.
- Owner-supplied LinkedIn profile: https://www.linkedin.com/in/galileo-kim-09a76b288/.
- The résumé is the source for numerical claims. No supporting test reports, analytics, or independent verification have been supplied.
- No project screenshots, portrait, logo, or downloadable résumé PDF have been supplied. The LaTeX references `coop_footer_updated.png`, but the image itself is absent.

## Product Principles

- Put Galileo's background and work ahead of the decorative effect.
- Use the ink-waterbrush interaction to support the personal canvas concept without obscuring content or obstructing links.
- Ground the website's content in Galileo's supplied information. Leave missing facts open rather than filling them with plausible claims.
- Keep education, technical work, and extracurricular involvement represented so visitors can understand more than a list of skills.
