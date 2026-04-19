import { Link } from "react-router-dom";
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import logoMark from "@/assets/logo-mark.png";

const footerLinks = {
  Product: [
    { label: "How It Works", path: "/#how-it-works" },
    // { label: "Pricing", path: "/#pricing" },
    { label: "Product Studio Tools", path: "/#startup-tools" },
  ],
  Company: [
    { label: "About", path: "/#about" },
    { label: "Blog", path: "/blog" },
    { label: "Contact", path: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Terms and Conditions", path: "/terms-and-conditions" },
    { label: "Data Deletion Policy", path: "/data-deletion" },
    { label: "Social Media Policy", path: "/social-media-policy" },
  ],
};

const socialLinks = [
  { label: "LinkedIn", icon: Linkedin, url: "https://www.linkedin.com/company/productnerveai/" },
  { label: "Instagram", icon: Instagram, url: "https://www.instagram.com/productnerveai/" },
  { label: "X", icon: Twitter, url: "https://x.com/productnerveai" },
  { label: "YouTube", icon: Youtube, url: "https://www.youtube.com/@ProductNerveAI" },
  { label: "TikTok", url: "https://www.tiktok.com/@productnerveai" },
  { label: "Facebook", url: "https://web.facebook.com/productnerveai" },
  { label: "Threads", url: "https://www.threads.com/@productnerveai" },
];

function SocialIcon({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold leading-none">
      {label === "TikTok" ? "TK" : label === "Facebook" ? "FB" : label === "Threads" ? "TH" : ""}
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-lg mb-4">
              <img src={logoMark} alt="Product Nerve AI" className="h-8 w-8 rounded-lg" />
              Product Nerve AI
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Structured venture intelligence for founders who build with discipline.
            </p>
            <p className="text-sm text-muted-foreground">hello@productnerve.com</p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.path + link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Product Nerve AI. All rights reserved.</p>
          <div className="flex gap-3">
            {socialLinks.map((s) => {
              const IconComponent = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-150"
                >
                  {IconComponent ? (
                    <IconComponent className="h-4 w-4" />
                  ) : (
                    <SocialIcon label={s.label} />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
