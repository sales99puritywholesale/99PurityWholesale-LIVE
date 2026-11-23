'use client';

import { useEffect, useRef, useState } from 'react';
import { Boxes, FileCheck2, FlaskConical, KeyRound, PackageCheck, ShoppingCart, Truck, UserCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Eyebrow, PillButton, h2 } from './ui';
import { RevealGroup, SplitHeading } from './Reveal';
import { MOTION_OK } from './gsap-setup';
import { PANES, type Ui } from './platform-panes';

type Role = 'you' | 'we';
interface Feature {
  nav: string;
  title: string;
  desc: string;
}

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
  tabs: Record<Role, string>;
  tabsLabel: string;
  features: Record<Role, Feature[]>;
  ui: Ui;
  cta: { label: string; href: string };
  cta2: { label: string; href: string };
}

const DURATION = 7000;
const ICONS = {
  you: [ShoppingCart, Truck, FileCheck2, KeyRound],
  we: [UserCheck, FlaskConical, PackageCheck, Boxes],
} as const;
const PATHS = {
  you: ['/client/shop', '/client/orders', '/client/certificates', '/client/api-keys'],
  we: ['/client/account', '/client/certificates', '/client/fulfillment/orders', '/client/stock'],
} as const;

/**
 * Homepage section that shows what a wholesale client can do in the portal and what 99 Purity handles for them, as animated interface
 * previews. A feature list drives a browser-window mockup; it auto-advances while in view (paused on hover,
 * off for reduced motion) and every feature is real text in the HTML for search engines.
 */
export default function PlatformShowcase({ eyebrow, title, description, note, tabs, tabsLabel, features, ui, cta, cta2 }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [role, setRole] = useState<Role>('you');
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(false);
  const [started, setStarted] = useState(false);
  const [hover, setHover] = useState(false);
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    setMotion(window.matchMedia(MOTION_OK).matches);
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting) setStarted(true);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const playing = motion && inView && !hover;
  const list = features[role];
  const Pane = PANES[role][idx];

  const next = () => {
    if (idx < list.length - 1) setIdx(idx + 1);
    else {
      setRole(role === 'you' ? 'we' : 'you');
      setIdx(0);
    }
  };
  const pick = (r: Role, i: number) => {
    setRole(r);
    setIdx(i);
  };

  return (
    <div className="mx-3 overflow-hidden rounded-[1.75rem] bg-[#0B0D10] py-16 text-white md:mx-4 md:py-24">
      <div className="relative mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#4FC3D0]/10 blur-3xl" aria-hidden="true" />

        <div className="relative mb-10 flex flex-col justify-between gap-6 md:mb-14 lg:flex-row lg:items-end">
          <div>
            <Eyebrow light className="mb-5">{eyebrow}</Eyebrow>
            <SplitHeading text={title} className={`${h2} max-w-3xl !text-white`} />
          </div>
          <p className="max-w-sm text-[13px] leading-relaxed text-white/60">{description}</p>
        </div>

        <div ref={rootRef} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} className="relative">
          <div role="tablist" aria-label={tabsLabel} className="mb-8 inline-flex rounded-full border border-white/15 p-1">
            {(['you', 'we'] as const).map((r) => (
              <button
                key={r}
                role="tab"
                type="button"
                aria-selected={role === r}
                onClick={() => pick(r, 0)}
                className={`rounded-full px-5 py-2 font-dm-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-300 ${role === r ? 'bg-[#4FC3D0] text-[#0B0F14]' : 'text-white/60 hover:text-white'}`}
              >
                {tabs[r]}
              </button>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12">
            {/* Feature lists. Both roles stay in the HTML (the inactive one is `hidden`) so the copy is crawlable. */}
            <div>
              {(['you', 'we'] as const).map((r) => (
                <ol key={r} hidden={role !== r} className="border-b border-white/10">
                  {features[r].map((f, i) => {
                    const active = role === r && idx === i;
                    return (
                      <li key={f.title} className="relative border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => pick(r, i)}
                          aria-current={active ? 'true' : undefined}
                          className="flex w-full items-start gap-5 py-5 text-left md:py-6"
                        >
                          <span className={`pt-1.5 font-dm-mono text-[10px] tracking-[0.2em] transition-colors ${active ? 'text-[#4FC3D0]' : 'text-white/35'}`}>0{i + 1}</span>
                          <span className="flex-1">
                            <span className={`block text-[1.1rem] font-light leading-snug tracking-[-0.02em] transition-colors duration-300 md:text-[1.35rem] ${active ? 'text-white' : 'text-white/50'}`}>{f.title}</span>
                            <span className={`grid transition-[grid-template-rows] duration-500 ease-out ${active ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                              <span className="overflow-hidden">
                                <span className="block max-w-md pt-2.5 text-[13px] leading-relaxed text-white/60">{f.desc}</span>
                              </span>
                            </span>
                          </span>
                        </button>
                        {active && motion && started && (
                          <span
                            key={`${r}-${i}`}
                            onAnimationEnd={next}
                            style={{ animationDuration: `${DURATION}ms`, animationPlayState: playing ? 'running' : 'paused' }}
                            className="absolute inset-x-0 bottom-0 h-px origin-left animate-[plat-fill_1ms_linear_forwards] bg-[#4FC3D0]"
                          />
                        )}
                      </li>
                    );
                  })}
                </ol>
              ))}
            </div>

            {/* Browser-window mockup (illustration). aria-hidden: the same information is in the list beside it. */}
            <div aria-hidden="true" className="relative">
              <div className="overflow-hidden rounded-[1.1rem] border border-white/10 bg-[#F3F5FA] text-[#0B0F14] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-3 border-b border-[#E6EAF1] bg-white px-4 py-2.5">
                  <span className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#E6EAF1]" />
                    <span className="h-2 w-2 rounded-full bg-[#E6EAF1]" />
                    <span className="h-2 w-2 rounded-full bg-[#E6EAF1]" />
                  </span>
                  <span className="min-w-0 flex-1 truncate rounded-full bg-[#F3F5FA] px-3.5 py-1 text-center font-dm-mono text-[10px] tracking-[0.04em] text-[#0B0F14]/50">
                    99puritywholesale.com{PATHS[role][idx]}
                  </span>
                </div>
                <div className="flex min-h-[21rem] md:min-h-[24rem]">
                  <div className="hidden w-14 shrink-0 flex-col items-center gap-2.5 border-r border-[#E6EAF1] bg-white py-4 sm:flex">
                    {ICONS[role].map((Icon, i) => (
                      <span
                        key={i}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-300 ${i === idx ? 'bg-[#0B0D10] text-[#4FC3D0]' : 'text-[#0B0F14]/35'}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                    ))}
                    <span className="mt-1 h-px w-5 bg-[#E6EAF1]" />
                    <span className="h-1.5 w-5 rounded-full bg-[#E6EAF1]" />
                    <span className="h-1.5 w-5 rounded-full bg-[#E6EAF1]" />
                  </div>
                  <div className="min-w-0 flex-1 p-4 md:p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="text-[1.05rem] font-light tracking-[-0.03em]">{list[idx].nav}</div>
                      <span className="rounded-full border border-[#E6EAF1] bg-white px-2.5 py-1 font-dm-mono text-[9px] uppercase tracking-[0.14em] text-[#0B0F14]/45">{tabs[role]}</span>
                    </div>
                    <div key={`${role}-${idx}-${started ? 1 : 0}`} className="animate-[plat-in_500ms_ease-out_both]">
                      <Pane ui={ui} />
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-4 font-dm-mono text-[9px] uppercase tracking-[0.18em] text-white/40">{note}</p>
            </div>
          </div>
        </div>

        <RevealGroup className="relative mt-12 flex flex-wrap items-center gap-3 md:mt-16">
          <div data-reveal>
            <PillButton href={cta.href} variant="teal">{cta.label}</PillButton>
          </div>
          <div data-reveal>
            <Link href={cta2.href} className="inline-flex items-center rounded-full border border-white/25 px-5 py-[0.9rem] text-[13px] font-medium transition-colors hover:bg-white hover:text-[#0B0F14]">
              {cta2.label}
            </Link>
          </div>
        </RevealGroup>
      </div>
    </div>
  );
}
