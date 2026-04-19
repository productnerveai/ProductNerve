export default function DataDeletionPolicyPage() {
  return (
    <div className="container max-w-4xl py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Data Deletion Policy</h1>
      <p className="text-muted-foreground mb-10">Last Updated: March 8th, 2026</p>

      <div className="space-y-10 text-foreground/90 leading-relaxed">
        <Section title="1. User Data Control">
          <p>Users have full control over their personal data and may request deletion at any time.</p>
        </Section>

        <Section title="2. Account Deletion">
          <p>Users may request account deletion by contacting:</p>
          <p className="mt-2">
            <a href="mailto:hello@productnerve.com" className="text-primary underline font-semibold">hello@productnerve.com</a>
          </p>
          <p className="mt-3">Requests must include:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account email</li>
            <li>Confirmation of deletion request</li>
          </ul>
        </Section>

        <Section title="3. What Happens When Data Is Deleted">
          <p>Upon deletion request:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account access is terminated</li>
            <li>Personal information is removed</li>
            <li>Platform-generated project data may be permanently deleted</li>
            <li>Backups may be removed within a reasonable timeframe</li>
          </ul>
        </Section>

        <Section title="4. Retention Exceptions">
          <p>Certain data may be retained temporarily for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Legal compliance</li>
            <li>Fraud prevention</li>
            <li>Dispute resolution</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-3 text-foreground">{title}</h2>
      <div className="space-y-3 text-sm md:text-base">{children}</div>
    </section>
  );
}
