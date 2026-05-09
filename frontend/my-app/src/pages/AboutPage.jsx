import { Facebook, Github, Instagram, Linkedin, Mail, Sparkles } from "lucide-react";

const teamMembers = [
  {
    name: "Syed Kaleem Ul Haq",
    role: "Frontend Developer",
    email: "syed@codecartel.dev",
    description: "Builds intuitive interfaces that make medicine search and discovery feel effortless.",
  },
  {
    name: "Ahmad Murtaza Khan",
    role: "Backend Developer",
    email: "ahmad@codecartel.dev",
    description: "Designs robust APIs and authentication workflows for secure pharmacy operations.",
  },
  {
    name: "Sheikh Ahmad Abdul Daim",
    role: "UI/UX Designer",
    email: "daim@codecartel.dev",
    description: "Crafts premium startup-style experiences with clean visuals and clear interactions.",
  },
  {
    name: "Farhaan Ghasi",
    role: "Database Engineer",
    email: "farhaan@codecartel.dev",
    description: "Optimizes schema and query flow to keep inventory and search data fast and reliable.",
  },
];

const socialPlatforms = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Facebook", href: "https://facebook.com", icon: Facebook },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { label: "GitHub", href: "https://github.com", icon: Github },
];

export function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-teal-400/5 to-transparent" />
        <div className="container-page relative py-14 md:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 py-1.5 text-sm shadow-sm">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="font-medium">About MediBridge</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Building faster access to medicines with a{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                modern healthcare workflow
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base-content/80 md:text-lg">
              MediBridge helps users discover medicines nearby instantly while helping pharmacies manage
              inventory efficiently. We combine quick search, smart stock visibility, and dependable backend
              systems to make healthcare access smoother for everyone.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page pb-6">
        <div className="card border border-base-300 bg-base-100/90 shadow-sm">
          <div className="card-body p-6 md:p-8">
            <h2 className="text-2xl font-bold md:text-3xl">Code Cartel</h2>
            <p className="mt-2 text-base-content/75">
              We are a cross-functional hackathon team focused on meaningful medical utility, polished product
              UX, and scalable architecture.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-base-300 bg-base-200/60 px-3 py-2 text-sm">
              <Mail className="h-4 w-4 text-emerald-600" />
              <a href="mailto:team@codecartel.dev" className="font-medium transition-colors hover:text-emerald-600">
                team@codecartel.dev
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-6 md:py-10">
        <div className="grid gap-5 md:grid-cols-2">
          {teamMembers.map((member) => (
            <article
              key={member.email}
              className="group rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
            >
              <p className="text-xs uppercase tracking-wide text-emerald-700/80">{member.role}</p>
              <h3 className="mt-1 text-xl font-semibold">{member.name}</h3>
              <p className="mt-3 text-sm text-base-content/75">{member.description}</p>

              <a
                href={`mailto:${member.email}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-base-content/80 transition-colors hover:text-emerald-600"
              >
                <Mail className="h-4 w-4" />
                {member.email}
              </a>

              <div className="mt-5 flex items-center gap-2">
                {socialPlatforms.map(({ label, href, icon: Icon }) => (
                  <a
                    key={`${member.email}-${label}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on ${label}`}
                    className="btn btn-circle btn-sm border border-base-300 bg-base-100 text-base-content/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:text-emerald-600"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
