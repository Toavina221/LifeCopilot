import { SiteLayout } from "@/components/SiteLayout";
import { Streamdown } from "streamdown";

// Variable centralisée : remplacez ici pour changer l'email de contact sur tout le site
export const CONTACT_EMAIL = "taylorethan579te@gmail.com";

export function LegalPage({
  title,
  subtitle,
  sections,
}: {
  title: string;
  subtitle: string;
  sections: { heading: string; content: string }[];
}) {
  return (
    <SiteLayout>
      <section className="container max-w-3xl py-12">
        <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
        <p className="mt-3 text-muted-foreground">{subtitle}</p>
        <div className="mt-10 space-y-10">
          {sections.map((s, i) => (
            <div key={i} className="border-t border-border/70 pt-6">
              <h2 className="text-xl font-semibold">{s.heading}</h2>
              <div className="mt-4 text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground [&_strong]:font-medium [&_a]:text-primary [&_a]:underline">
                <Streamdown>{replaceEmail(s.content)}</Streamdown>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Pour toute question relative à ce document, contactez-nous à{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}

export function replaceEmail(content: string): string {
  return content.replace(/{{CONTACT_EMAIL}}/g, CONTACT_EMAIL);
}
