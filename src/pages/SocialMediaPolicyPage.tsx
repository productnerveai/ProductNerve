export default function SocialMediaPolicyPage() {
  return (
    <div className="container max-w-4xl py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Social Media Policy</h1>
      <p className="text-muted-foreground mb-10">Product Nerve AI</p>

      <div className="space-y-10 text-foreground/90 leading-relaxed">
        <Section title="1. Purpose">
          <p>Product Nerve AI maintains social media accounts to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Share educational content</li>
            <li>Provide updates</li>
            <li>Engage with the startup community</li>
          </ul>
        </Section>

        <Section title="2. Acceptable Engagement">
          <p>Users engaging with Product Nerve AI social media channels must not post:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Abusive language</li>
            <li>Harassment</li>
            <li>Hate speech</li>
            <li>Spam</li>
            <li>Misleading claims</li>
            <li>Illegal content</li>
          </ul>
        </Section>

        <Section title="3. Moderation">
          <p>Product Nerve AI reserves the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Remove inappropriate content</li>
            <li>Block users engaging in abusive behavior</li>
          </ul>
        </Section>

        <Section title="4. Content Ownership">
          <p>Content posted on Product Nerve AI social media accounts remains the property of Product Nerve AI unless stated otherwise.</p>
        </Section>

        <Section title="5. Disclaimer">
          <p>Opinions shared by users on social media platforms do not represent the official views of Product Nerve AI.</p>
        </Section>

        <section className="pt-6 border-t border-border">
          <h2 className="text-xl font-bold mb-3 text-foreground">Contact</h2>
          <div className="text-sm md:text-base space-y-1">
            <p>Product Nerve AI</p>
            <p>Email: <a href="mailto:hello@productnerve.com" className="text-primary underline font-semibold">hello@productnerve.com</a></p>
          </div>
        </section>
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
