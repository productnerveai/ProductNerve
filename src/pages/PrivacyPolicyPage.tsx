export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl py-16 md:py-24">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Privacy Policy</h1>
      <p className="text-muted-foreground mb-10">Last Updated: March 8th, 2026</p>

      <div className="space-y-10 text-foreground/90 leading-relaxed">
        {/* 1 */}
        <Section title="1. Introduction">
          <p>
            Product Nerve AI ("Product Nerve AI", "we", "our", or "us") respects your privacy and is committed to protecting the personal information of our users.
          </p>
          <p>
            This Privacy Policy explains how we collect, use, process, store, and protect your personal information when you use:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The Product Nerve AI website</li>
            <li>The Product Nerve AI platform and services</li>
            <li>Any related services, tools, or communications</li>
          </ul>
          <p>Product Nerve AI serves users globally, including users located in Africa, North America, and Europe.</p>
          <p className="font-semibold mt-4">Our primary markets include:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <MarketBlock title="Africa" countries="Nigeria, Kenya, Uganda, Ghana, South Africa, Rwanda, Namibia, Tanzania, Cameroon, Morocco" />
            <MarketBlock title="North America" countries="United States, Canada" />
            <MarketBlock title="Europe" countries="United Kingdom, Germany, Netherlands, France, Ireland, Sweden, Norway, Denmark" />
          </div>
          <p>By using our platform, you agree to the terms outlined in this Privacy Policy.</p>
        </Section>

        {/* 2 */}
        <Section title="2. Information We Collect">
          <p>We collect information necessary to operate the Product Nerve AI platform and provide our services.</p>

          <h4 className="font-semibold mt-4">2.1 Personal Information</h4>
          <p>When you create an account, we may collect:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>First name</li>
            <li>Last name</li>
            <li>Company name</li>
            <li>Email address</li>
            <li>Password</li>
            <li>Phone number (optional)</li>
            <li>Business information</li>
          </ul>

          <h4 className="font-semibold mt-4">2.2 Business and Startup Data</h4>
          <p>Because Product Nerve AI is a venture intelligence platform, users may voluntarily provide business information such as:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Startup ideas</li>
            <li>Product concepts</li>
            <li>Market data</li>
            <li>Financial projections</li>
            <li>Growth plans</li>
            <li>Product documentation</li>
            <li>Strategic plans</li>
          </ul>
          <p>This information is used solely to provide analysis and platform functionality.</p>

          <h4 className="font-semibold mt-4">2.3 Technical Data</h4>
          <p>We may collect technical data automatically, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Operating system</li>
            <li>Device information</li>
            <li>Session activity</li>
            <li>Usage patterns</li>
            <li>Platform interaction data</li>
          </ul>

          <h4 className="font-semibold mt-4">2.4 Analytics and Usage Data</h4>
          <p>We collect anonymized analytics to improve the platform, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Feature usage</li>
            <li>Session duration</li>
            <li>Interaction flows</li>
            <li>Tool usage patterns</li>
          </ul>
        </Section>

        {/* 3 */}
        <Section title="3. How We Use Your Information">
          <p>We use collected data for the following purposes:</p>
          <dl className="space-y-3 mt-2">
            <DefItem term="Service Delivery" desc="To operate the Product Nerve AI platform and deliver its features." />
            <DefItem term="Account Management" desc="To create and manage user accounts." />
            <DefItem term="Platform Improvement" desc="To improve system performance, algorithms, and product features." />
            <DefItem term="Customer Support" desc="To respond to inquiries, issues, or support requests." />
            <DefItem term="Security Monitoring" desc="To prevent fraud, abuse, or unauthorized access." />
            <DefItem term="Communication" desc="To send service updates, product notifications, and relevant communications." />
          </dl>
        </Section>

        {/* 4 */}
        <Section title="4. AI Processing and Automated Analysis">
          <p>Product Nerve AI uses artificial intelligence models to analyze and interpret information provided by users.</p>
          <p>These analyses may generate:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Venture validation insights</li>
            <li>Growth strategies</li>
            <li>Product recommendations</li>
            <li>Business intelligence outputs</li>
          </ul>
          <p className="text-muted-foreground italic mt-2">
            AI-generated outputs are advisory and informational and should not be interpreted as professional financial, legal, or investment advice.
          </p>
        </Section>

        {/* 5 */}
        <Section title="5. Data Storage and Security">
          <p>We implement strong security practices to protect user data. These include:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Encrypted data transmission</li>
            <li>Role-based access control</li>
            <li>Secure server environments</li>
            <li>Monitoring and logging systems</li>
            <li>Limited internal access to sensitive data</li>
          </ul>
          <p className="text-muted-foreground text-sm mt-2">Despite our efforts, no digital platform can guarantee absolute security.</p>
        </Section>

        {/* 6 */}
        <Section title="6. Data Sharing and Disclosure">
          <p className="font-semibold">We do not sell user data.</p>
          <p>Your information may only be shared in the following circumstances:</p>
          <dl className="space-y-3 mt-2">
            <DefItem term="Service Providers" desc="With trusted infrastructure providers that support platform operations." />
            <DefItem term="Legal Compliance" desc="If required by law or legal process." />
            <DefItem term="Security Protection" desc="To protect the safety, rights, and integrity of our platform." />
          </dl>
        </Section>

        {/* 7 */}
        <Section title="7. International Data Transfers">
          <p>
            Because Product Nerve AI serves a global user base, user data may be processed and stored in multiple jurisdictions. We ensure that appropriate safeguards are applied to protect user information in accordance with global data protection standards.
          </p>
        </Section>

        {/* 8 */}
        <Section title="8. Data Retention">
          <p>We retain personal information only for as long as necessary to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide services</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce platform agreements</li>
          </ul>
          <p>Users may request deletion of their data as described in the Data Deletion Policy.</p>
        </Section>

        {/* 9 */}
        <Section title="9. User Rights">
          <p>Depending on your location, you may have rights including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access to your personal data</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your data</li>
            <li>Restriction of processing</li>
            <li>Objection to certain processing activities</li>
          </ul>
          <p>Requests can be made via email.</p>
        </Section>

        {/* 10 */}
        <Section title="10. Children's Privacy">
          <p>
            Product Nerve AI is intended for use by adults and professionals. We do not knowingly collect information from individuals under the age of 18.
          </p>
        </Section>

        {/* 11 */}
        <Section title="11. Updates to This Policy">
          <p>We may update this Privacy Policy from time to time. Users will be notified of significant changes through the platform or website.</p>
        </Section>

        {/* 12 */}
        <Section title="12. Contact Information">
          <p>For privacy-related inquiries, please contact:</p>
          <p className="mt-2">
            <span className="font-semibold">Email:</span>{" "}
            <a href="mailto:hello@productnerve.com" className="text-primary underline">hello@productnerve.com</a>
          </p>
          <p>
            <span className="font-semibold">Website:</span>{" "}
            <a href="https://www.productnerve.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">www.productnerve.com</a>
          </p>
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

function DefItem({ term, desc }: { term: string; desc: string }) {
  return (
    <div>
      <dt className="font-semibold text-foreground">{term}</dt>
      <dd className="text-muted-foreground">{desc}</dd>
    </div>
  );
}

function MarketBlock({ title, countries }: { title: string; countries: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="font-semibold text-sm text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{countries}</p>
    </div>
  );
}
