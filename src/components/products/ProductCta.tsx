import { Link } from "@/navigation";

type Button = { label: string; href: string };

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

function CtaButton({ button, primary = false }: { button: Button; primary?: boolean }) {
  const className = primary
    ? "glow-pulse inline-flex items-center rounded-full bg-teal px-8 py-3.5 text-[15px] font-bold text-navy transition-colors duration-300 hover:bg-teal-cyan md:text-[16px]"
    : "inline-flex items-center rounded-full border-2 border-teal/70 px-8 py-3.5 text-[15px] font-bold text-white transition-all duration-300 hover:border-teal hover:bg-teal hover:text-navy md:text-[16px]";
  if (isExternal(button.href)) {
    return (
      <a href={button.href} target={button.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={className}>
        {button.label}
      </a>
    );
  }
  return (
    <Link href={button.href} className={className}>
      {button.label}
    </Link>
  );
}

/* Closing call-to-action panel on the product pages. */
export default function ProductCta({ title, text, primary, buttons = [] }: { title: string; text: string; primary: Button; buttons?: Button[] }) {
  return (
    <section className="relative py-12 md:py-16">
      <div className="container-tk">
        <div className="relative overflow-hidden rounded-[28px] border border-teal/30 bg-gradient-to-br from-[#0b4155] to-[#052536] px-8 py-12 text-center md:px-14 md:py-14">
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] binary-bg" />
          <div className="pointer-events-none absolute -top-28 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-teal/20 blur-[90px] rtl:translate-x-1/2" />
          <h2 className="glow-title relative text-[24px] font-bold leading-snug text-white md:text-[32px]">{title}</h2>
          <p className="relative mx-auto mt-4 max-w-[680px] text-[15px] leading-[1.95] text-iceblue md:text-[17px]">{text}</p>
          <div className="stagger relative mt-8 flex flex-wrap items-center justify-center gap-4">
            <CtaButton button={primary} primary />
            {buttons.map((b) => (
              <CtaButton key={b.href + b.label} button={b} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
