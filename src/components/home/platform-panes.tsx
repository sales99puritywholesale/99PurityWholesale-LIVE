'use client';

import { useRef } from 'react';
import type gsapType from 'gsap';
import { Check, FileText, Minus, Plus, Truck } from 'lucide-react';
import { registerGsap, useIsoLayoutEffect, MOTION_OK } from './gsap-setup';

/**
 * Animated interface previews for the homepage "Platform" section. They are illustrations built from
 * sample data, not screenshots. The markup is written in its FINISHED state; animation only plays from a
 * start state toward it (and only when reduced motion is not requested), so with motion off, or before
 * JavaScript runs, every screen already reads correctly.
 */
export type Ui = Record<string, string>;

type Build = (gsap: typeof gsapType, root: HTMLElement) => void;

function usePane(build: Build) {
  const ref = useRef<HTMLDivElement>(null);
  useIsoLayoutEffect(() => {
    const { gsap } = registerGsap();
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const ctx = gsap.context(() => build(gsap, el), el);
      return () => ctx.revert();
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

/** Counts a text node up to its data-to value. */
function countUp(gsap: typeof gsapType, el: HTMLElement, delay = 0, duration = 1.1) {
  const to = Number(el.dataset.to ?? el.textContent);
  const o = { v: 0 };
  el.textContent = '0';
  gsap.to(o, {
    v: to,
    duration,
    delay,
    ease: 'power2.out',
    onUpdate: () => {
      el.textContent = String(Math.round(o.v));
    },
  });
}

const chip = 'inline-flex items-center rounded-full px-2.5 py-1 font-dm-mono text-[9px] uppercase tracking-[0.14em]';
const label = 'font-dm-mono text-[9px] uppercase tracking-[0.18em] text-[#0B0F14]/45';
const rowCls = 'flex items-center gap-3 rounded-xl border border-[#E6EAF1] bg-white px-3.5 py-3';

/* ---------------------------------- CLIENT ---------------------------------- */

export function ShopPane({ ui }: { ui: Ui }) {
  const rows = [
    { n: 'BPC-157 5mg', s: 'BPC157-5', q: 6 },
    { n: 'TB-500 5mg', s: 'TB500-5', q: 10 },
    { n: 'Ipamorelin 5mg', s: 'IPA-5', q: 4 },
    { n: 'CJC-1295 5mg', s: 'CJC-5', q: 4 },
  ];
  const ref = usePane((gsap, el) => {
    gsap.from(el.querySelectorAll('[data-row]'), { y: 16, autoAlpha: 0, stagger: 0.1, duration: 0.55, ease: 'power3.out' });
    el.querySelectorAll<HTMLElement>('[data-count]').forEach((n, i) => countUp(gsap, n, 0.5 + i * 0.2));
    const total = el.querySelector<HTMLElement>('[data-total]');
    if (total) countUp(gsap, total, 0.5, 1.5);
    gsap.from(el.querySelector('[data-bar]'), { scaleX: 0.2, transformOrigin: 'left', duration: 1.6, delay: 0.5, ease: 'power2.out' });
    const tier = el.querySelector<HTMLElement>('[data-tier]');
    if (tier) {
      tier.textContent = ui.tier1;
      gsap.delayedCall(1.5, () => {
        tier.textContent = ui.tier2;
      });
    }
  });
  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
      <div className="space-y-2.5">
        <div className={label}>{ui.catalog}</div>
        {rows.map((r) => (
          <div key={r.s} data-row className={rowCls}>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium">{r.n}</div>
              <div className="font-dm-mono text-[9px] tracking-[0.12em] text-[#0B0F14]/40">{r.s}</div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#E6EAF1] px-1.5 py-1">
              <Minus className="h-3 w-3 text-[#0B0F14]/40" />
              <span data-count data-to={r.q} className="w-5 text-center font-dm-mono text-[11px]">{r.q}</span>
              <Plus className="h-3 w-3 text-[#0B6F7B]" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-[#0B0D10] p-5 text-white">
        <div className="font-dm-mono text-[9px] uppercase tracking-[0.18em] text-white/50">{ui.kits}</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span data-total data-to="24" className="text-[2.6rem] font-light leading-none tracking-[-0.05em]">24</span>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <span data-tier className={`${chip} bg-[#4FC3D0] text-[#0B0F14]`}>{ui.tier2}</span>
          <span className="font-dm-mono text-[9px] uppercase tracking-[0.14em] text-white/45">{ui.nextTier}</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div data-bar className="h-full w-[72%] rounded-full bg-[#4FC3D0]" />
        </div>
        <div className="mt-6 rounded-full bg-white py-2.5 text-center text-[12px] font-medium text-[#0B0F14]">{ui.checkout}</div>
      </div>
    </div>
  );
}

export function TrackPane({ ui }: { ui: Ui }) {
  const steps = [ui.placed, ui.confirmed, ui.packed, ui.shipped];
  const ref = usePane((gsap, el) => {
    const dots = el.querySelectorAll('[data-dot]');
    gsap.from(dots, { backgroundColor: '#E6EAF1', color: '#9aa4b2', scale: 0.78, stagger: 0.55, duration: 0.35, delay: 0.3, ease: 'back.out(2)' });
    gsap.from(el.querySelector('[data-line]'), { scaleX: 0, transformOrigin: 'left', duration: 1.65, delay: 0.3, ease: 'none' });
    const status = el.querySelector<HTMLElement>('[data-status]');
    if (status) {
      steps.forEach((s, i) => gsap.delayedCall(0.3 + i * 0.55, () => { status.textContent = s; }));
    }
    gsap.from(el.querySelectorAll('[data-late]'), { autoAlpha: 0, y: 12, stagger: 0.15, duration: 0.5, delay: 2.1, ease: 'power3.out' });
  });
  return (
    <div ref={ref}>
      <div className="flex items-center justify-between">
        <div>
          <div className={label}>{ui.orderRef}</div>
          <div className="mt-1 font-dm-mono text-[15px] tracking-[0.04em]">ORD-2417</div>
        </div>
        <span data-status className={`${chip} bg-[#4FC3D0]/20 text-[#0B6F7B]`}>{ui.shipped}</span>
      </div>
      <div className="relative mt-8 mb-9">
        <div className="absolute left-4 right-4 top-4 h-px bg-[#E6EAF1]" />
        <div data-line className="absolute left-4 right-4 top-4 h-px bg-[#0B6F7B]" />
        <div className="relative grid grid-cols-4">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-2.5 text-center">
              <span data-dot className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B6F7B] text-white">
                {i === steps.length - 1 ? <Check className="h-3.5 w-3.5" /> : <span className="font-dm-mono text-[10px]">{i + 1}</span>}
              </span>
              <span className="text-[11px] font-medium text-[#0B0F14]/70">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div data-late className={rowCls}>
          <div className="min-w-0 flex-1">
            <div className={label}>{ui.tracking}</div>
            <div className="mt-1 truncate font-dm-mono text-[11px]">1Z•••••••••••7365</div>
          </div>
          <span className={`${chip} bg-[#F3F5FA] text-[#0B0F14]/60`}>{ui.carrier}</span>
        </div>
        <div data-late className={rowCls}>
          <div className="min-w-0 flex-1">
            <div className={label}>{ui.invoice}</div>
            <div className="mt-1 font-dm-mono text-[11px]">INV-2417</div>
          </div>
          <span className={`${chip} bg-[#4FC3D0]/20 text-[#0B6F7B]`}>{ui.issued}</span>
        </div>
      </div>
    </div>
  );
}

export function CoaPane({ ui }: { ui: Ui }) {
  const rows = [
    { n: 'BPC-157', l: 'LOT 24A-0187' },
    { n: 'TB-500', l: 'LOT 24B-0212' },
    { n: 'Ipamorelin', l: 'LOT 24C-0098' },
  ];
  const ref = usePane((gsap, el) => {
    gsap.from(el.querySelectorAll('[data-row]'), { y: 16, autoAlpha: 0, stagger: 0.12, duration: 0.55, ease: 'power3.out' });
    gsap.from(el.querySelector('[data-dl]'), { scaleX: 0, transformOrigin: 'left', duration: 1.3, delay: 0.9, ease: 'power1.inOut' });
    gsap.from(el.querySelector('[data-done]'), { scale: 0, duration: 0.4, delay: 2.2, ease: 'back.out(2.5)' });
    gsap.from(el.querySelectorAll('[data-peak]'), { scaleY: 0, transformOrigin: 'bottom', stagger: 0.07, duration: 0.7, delay: 0.5, ease: 'power3.out' });
  });
  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
      <div className="space-y-2.5">
        <div className={label}>{ui.library}</div>
        {rows.map((r, i) => (
          <div key={r.l} data-row className={`${rowCls} relative overflow-hidden`}>
            {i === 1 && <div data-dl className="absolute inset-y-0 left-0 w-full bg-[#4FC3D0]/15" />}
            <FileText className="relative h-4 w-4 shrink-0 text-[#0B6F7B]" />
            <div className="relative min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium">{r.n}</div>
              <div className="font-dm-mono text-[9px] tracking-[0.12em] text-[#0B0F14]/40">{r.l}</div>
            </div>
            <span className={`${chip} relative bg-[#F3F5FA] text-[#0B0F14]/70`}>≥99% HPLC</span>
            {i === 1 ? (
              <span data-done className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#0B6F7B] text-white">
                <Check className="h-3 w-3" />
              </span>
            ) : (
              <span className="relative font-dm-mono text-[9px] uppercase tracking-[0.14em] text-[#0B6F7B]">{ui.pdf}</span>
            )}
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-[#E6EAF1] bg-[#F7F9FC] p-4">
        <div className={label}>{ui.chromatogram}</div>
        <div className="mt-4 flex h-24 items-end gap-1.5 border-b border-[#0B0F14]/15">
          {[8, 10, 7, 12, 9, 88, 14, 10, 6, 9, 7, 5].map((h, i) => (
            <div key={i} data-peak className="flex-1 rounded-t-sm bg-[#0B6F7B]/80" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="mt-3 font-dm-mono text-[9px] uppercase tracking-[0.14em] text-[#0B0F14]/45">{ui.sample}</div>
      </div>
    </div>
  );
}

export function ApiPane({ ui }: { ui: Ui }) {
  const ref = usePane((gsap, el) => {
    gsap.from(el.querySelectorAll('[data-line]'), { autoAlpha: 0, x: -10, stagger: 0.22, duration: 0.35, ease: 'power2.out' });
    gsap.from(el.querySelector('[data-resp]'), { autoAlpha: 0, y: 14, duration: 0.55, delay: 2.5, ease: 'power3.out' });
  });
  const line = 'block whitespace-pre';
  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
      <div className="overflow-x-auto rounded-2xl bg-[#0B0D10] p-4 font-dm-mono text-[10.5px] leading-[1.9] text-white/75">
        <span data-line className={line}><span className="text-[#4FC3D0]">POST</span> /api/v1/orders</span>
        <span data-line className={line}>Authorization: Bearer <span className="text-white/40">pk_test_••••••••</span></span>
        <span data-line className={line}>Idempotency-Key: <span className="text-white/40">shop-1042</span></span>
        <span data-line className={line}>{'{'}</span>
        <span data-line className={line}>{'  '}<span className="text-[#9be3ea]">&quot;external_ref&quot;</span>: &quot;SHOP-1042&quot;,</span>
        <span data-line className={line}>{'  '}<span className="text-[#9be3ea]">&quot;recipient&quot;</span>: {'{ … }'},</span>
        <span data-line className={line}>{'  '}<span className="text-[#9be3ea]">&quot;lines&quot;</span>: [{'{ '}<span className="text-[#9be3ea]">&quot;sku&quot;</span>: &quot;BPC157-5&quot;, <span className="text-[#9be3ea]">&quot;quantity&quot;</span>: 10{' }'}]</span>
        <span data-line className={line}>{'}'}<span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-[#4FC3D0] align-middle" /></span>
      </div>
      <div data-resp className="flex flex-col justify-between rounded-2xl border border-[#E6EAF1] bg-white p-4">
        <div>
          <span className={`${chip} bg-[#4FC3D0]/20 text-[#0B6F7B]`}>{ui.orderCreated}</span>
          <div className="mt-4 text-[13px] font-medium leading-snug">{ui.apiTitle}</div>
          <p className="mt-2 text-[12px] leading-relaxed text-[#0B0F14]/55">{ui.apiNote}</p>
        </div>
        <div className="mt-4 flex gap-2">
          <span className={`${chip} bg-[#F3F5FA] text-[#0B0F14]/60`}>{ui.testKey}</span>
          <span className={`${chip} bg-[#F3F5FA] text-[#0B0F14]/60`}>{ui.webhooks}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- WHAT WE HANDLE ------------------------------ */

export function OnboardPane({ ui }: { ui: Ui }) {
  const steps = [ui.stepApplication, ui.stepDocs, ui.stepApproved, ui.stepTier, ui.stepPortal];
  const ref = usePane((gsap, el) => {
    gsap.from(el.querySelectorAll('[data-row]'), { y: 14, autoAlpha: 0, stagger: 0.12, duration: 0.5, ease: 'power3.out' });
    gsap.from(el.querySelectorAll('[data-check]'), { scale: 0, backgroundColor: '#E6EAF1', stagger: 0.42, duration: 0.4, delay: 0.7, ease: 'back.out(2.5)' });
    gsap.from(el.querySelector('[data-bar]'), { scaleX: 0, transformOrigin: 'left', duration: 2.1, delay: 0.7, ease: 'none' });
  });
  return (
    <div ref={ref}>
      <div className="flex items-center justify-between">
        <div className={label}>{ui.accountSetup}</div>
        <span className={`${chip} bg-[#4FC3D0]/20 text-[#0B6F7B]`}>{ui.ready}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
        <div data-bar className="h-full w-full rounded-full bg-[#0B6F7B]" />
      </div>
      <div className="mt-4 space-y-2">
        {steps.map((s, i) => (
          <div key={s} data-row className={rowCls}>
            <span data-check className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B6F7B] text-white">
              <Check className="h-3 w-3" />
            </span>
            <span className="flex-1 text-[13px] font-medium">{s}</span>
            <span className="font-dm-mono text-[9px] tracking-[0.14em] text-[#0B0F14]/35">0{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LabPane({ ui }: { ui: Ui }) {
  const steps = [ui.labSynth, ui.labTest, ui.labCoa];
  const ref = usePane((gsap, el) => {
    gsap.from(el.querySelectorAll('[data-dot]'), { backgroundColor: '#E6EAF1', color: '#9aa4b2', scale: 0.78, stagger: 0.6, duration: 0.35, delay: 0.3, ease: 'back.out(2)' });
    gsap.from(el.querySelector('[data-line]'), { scaleX: 0, transformOrigin: 'left', duration: 1.3, delay: 0.3, ease: 'none' });
    gsap.from(el.querySelectorAll('[data-peak]'), { scaleY: 0, transformOrigin: 'bottom', stagger: 0.07, duration: 0.7, delay: 0.9, ease: 'power3.out' });
    gsap.from(el.querySelectorAll('[data-late]'), { autoAlpha: 0, y: 12, stagger: 0.15, duration: 0.5, delay: 1.7, ease: 'power3.out' });
  });
  return (
    <div ref={ref}>
      <div className="relative mt-2 mb-7">
        <div className="absolute left-[16.7%] right-[16.7%] top-4 h-px bg-[#E6EAF1]" />
        <div data-line className="absolute left-[16.7%] right-[16.7%] top-4 h-px bg-[#0B6F7B]" />
        <div className="relative grid grid-cols-3">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-2.5 text-center">
              <span data-dot className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B6F7B] text-white">
                {i === steps.length - 1 ? <Check className="h-3.5 w-3.5" /> : <span className="font-dm-mono text-[10px]">{i + 1}</span>}
              </span>
              <span className="text-[11px] font-medium text-[#0B0F14]/70">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <div className="rounded-2xl border border-[#E6EAF1] bg-[#F7F9FC] p-4">
          <div className={label}>{ui.chromatogram}</div>
          <div className="mt-4 flex h-24 items-end gap-1.5 border-b border-[#0B0F14]/15">
            {[8, 10, 7, 12, 9, 88, 14, 10, 6, 9, 7, 5].map((h, i) => (
              <div key={i} data-peak className="flex-1 rounded-t-sm bg-[#0B6F7B]/80" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="mt-3 font-dm-mono text-[9px] uppercase tracking-[0.14em] text-[#0B0F14]/45">{ui.sample}</div>
        </div>
        <div className="space-y-2.5">
          <div data-late className={rowCls}>
            <FileText className="h-4 w-4 shrink-0 text-[#0B6F7B]" />
            <div className="min-w-0 flex-1">
              <div className={label}>{ui.lot}</div>
              <div className="mt-0.5 font-dm-mono text-[11px]">LOT 24A-0187</div>
            </div>
          </div>
          <div data-late className={rowCls}>
            <span className={`${chip} bg-[#F3F5FA] text-[#0B0F14]/70`}>≥99% HPLC</span>
            <span className="flex-1" />
            <span className={`${chip} bg-[#4FC3D0]/20 text-[#0B6F7B]`}>{ui.issued}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FulfillPane({ ui }: { ui: Ui }) {
  const nodes = [ui.yourStore, ui.us, ui.yourCustomer];
  const ref = usePane((gsap, el) => {
    gsap.from(el.querySelectorAll('[data-node]'), { y: 16, autoAlpha: 0, stagger: 0.18, duration: 0.55, ease: 'power3.out' });
    gsap.from(el.querySelectorAll('[data-conn]'), { scaleX: 0, transformOrigin: 'left', stagger: 0.4, duration: 0.6, delay: 0.5, ease: 'power2.out' });
    el.querySelectorAll<HTMLElement>('[data-dot]').forEach((d, i) => {
      gsap.fromTo(d, { left: '0%', autoAlpha: 0 }, { left: '100%', autoAlpha: 1, duration: 1.1, delay: 1.1 + i * 0.35, repeat: -1, repeatDelay: 0.9, ease: 'power1.inOut' });
    });
    gsap.from(el.querySelectorAll('[data-late]'), { autoAlpha: 0, y: 12, stagger: 0.15, duration: 0.5, delay: 1.6, ease: 'power3.out' });
  });
  return (
    <div ref={ref}>
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 sm:gap-3">
        {nodes.map((n, i) => (
          <div key={n} className="contents">
            <div data-node className={`${rowCls} flex-col justify-center py-5 text-center ${i === 1 ? '!border-[#0B6F7B] !bg-[#0B0D10] text-white' : ''}`}>
              <div className={`text-[12.5px] font-medium ${i === 1 ? 'text-white' : ''}`}>{n}</div>
            </div>
            {i < nodes.length - 1 && (
              <div className="relative h-px w-8 bg-[#E6EAF1] sm:w-14">
                <div data-conn className="absolute inset-0 bg-[#0B6F7B]" />
                <span data-dot className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4FC3D0] opacity-0" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
        <div data-late className={rowCls}>
          <div className="min-w-0 flex-1">
            <div className={label}>{ui.orderIn}</div>
            <div className="mt-1 font-dm-mono text-[11px]">SHOP-1042</div>
          </div>
          <span className={`${chip} bg-[#F3F5FA] text-[#0B0F14]/60`}>{ui.received}</span>
        </div>
        <div data-late className={rowCls}>
          <div className="min-w-0 flex-1">
            <div className={label}>{ui.tracking}</div>
            <div className="mt-1 truncate font-dm-mono text-[11px]">1Z•••••••••••7365</div>
          </div>
          <span className={`${chip} bg-[#4FC3D0]/20 text-[#0B6F7B]`}>{ui.shipped}</span>
        </div>
      </div>
    </div>
  );
}

export function StockPane({ ui }: { ui: Ui }) {
  const stock = [
    { n: 'BPC-157 5mg', w: 82 },
    { n: 'TB-500 5mg', w: 64 },
    { n: 'Ipamorelin 5mg', w: 71 },
    { n: 'CJC-1295 5mg', w: 56 },
  ];
  const ref = usePane((gsap, el) => {
    gsap.from(el.querySelectorAll('[data-fill]'), { scaleX: 0, transformOrigin: 'left', stagger: 0.12, duration: 1, ease: 'power3.out' });
    gsap.from(el.querySelectorAll('[data-row]'), { y: 12, autoAlpha: 0, stagger: 0.09, duration: 0.5, ease: 'power3.out' });
  });
  return (
    <div ref={ref}>
      <div className="flex items-center justify-between">
        <div className={label}>{ui.stock}</div>
        <span className={`${chip} bg-[#4FC3D0]/20 text-[#0B6F7B]`}>{ui.inStock}</span>
      </div>
      <div className="mt-4 space-y-2.5">
        {stock.map((s) => (
          <div key={s.n} data-row className={rowCls}>
            <div className="w-28 shrink-0 truncate text-[12.5px] font-medium">{s.n}</div>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F3F5FA]">
              <div data-fill className="h-full rounded-full bg-[#0B6F7B]" style={{ width: `${s.w}%` }} />
            </div>
            <span className="w-12 text-right font-dm-mono text-[10px] text-[#0B0F14]/45">{s.w}%</span>
          </div>
        ))}
      </div>
      <div data-row className={`${rowCls} mt-4 border-dashed`}>
        <Truck className="h-4 w-4 shrink-0 text-[#0B6F7B]" />
        <div className="min-w-0 flex-1">
          <div className={label}>{ui.inbound}</div>
          <div className="mt-0.5 font-dm-mono text-[11px]">IN-0311</div>
        </div>
        <span className={`${chip} bg-[#F3F5FA] text-[#0B0F14]/60`}>{ui.inTransit}</span>
      </div>
    </div>
  );
}

export const PANES = {
  you: [ShopPane, TrackPane, CoaPane, ApiPane],
  we: [OnboardPane, LabPane, FulfillPane, StockPane],
} as const;
