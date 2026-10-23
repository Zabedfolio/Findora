"use client";

import React from "react";
import { HelpCircle, ChevronDown, ShieldCheck, Mail, AlertTriangle } from "lucide-react";

export default function TrustFaqAccordion() {
  const faqs = [
    {
      q: "How does Findora protect my personal contact information?",
      a: "Findora never displays your personal phone number, home address, or private email address on public report listings. Communication between owners and finders occurs through our secured internal messaging system or masked relay channels. You decide when and if you wish to share contact information with a verified claimant.",
    },
    {
      q: "What should I do if someone demands a ransom or reward before returning my item?",
      a: "Extortion and ransom demands are strictly prohibited under Findora's Community Code of Conduct. If an individual holds your property hostage (particularly government IDs, student IDs, or passports), do not pay. Document the conversation, file an immediate Incident Report on Findora, and report the matter to campus security or local law enforcement.",
    },
    {
      q: "How does the blind ownership verification process work?",
      a: "When reporting a found item, the finder is instructed not to disclose all identifying characteristics (such as phone lock-screen wallpapers, engraving texts, or internal pouch contents). To claim the item, the true owner must submit this exact undisclosed information. If the answers match, the claim is approved for a safe in-person meeting.",
    },
    {
      q: "Can I remain anonymous when reporting a found item?",
      a: "Yes. Honest finders can choose to list items with a privacy pseudonym and arrange handover through verified institutional drop-off desks (such as university security desks or public library information counters), allowing items to be reunited without revealing your personal identity.",
    },
    {
      q: "What measures are taken against users who submit fake or malicious reports?",
      a: "Findora utilizes automated anomaly detection and community review flaggings. Accounts caught submitting falsified reports, spamming bogus claims, or attempting advance-payment schemes are permanently blacklisted across our platform and associated device fingerprints.",
    },
  ];

  return (
    <section className="py-20 bg-slate-50 dark:bg-[#070a05] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold mb-3">
            <HelpCircle className="w-4 h-4 text-[#72a800] dark:text-[#9ae600]" />
            <span>SAFETY & PRIVACY FAQ</span>
          </div>
          <h2 className="text-3xl font-extrabold font-heading text-slate-950 dark:text-white tracking-tight">
            Frequently Asked Trust Questions
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Learn more about our verification protocols, data retention policies, and dispute resolution mechanisms.
          </p>
        </div>

        {/* Mutually exclusive <details> accordion per modern-web-guidance (search-hidden-content) */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              name="safety-faq"
              className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-all open:border-[#9ae600]/40 open:shadow-md cursor-pointer list-none [&::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white select-none focus:outline-hidden">
                <span className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-mono font-semibold flex items-center justify-center shrink-0 group-open:bg-[#9ae600] group-open:text-slate-950 transition-colors">
                    0{idx + 1}
                  </span>
                  <span>{faq.q}</span>
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200 group-open:rotate-180 shrink-0" />
              </summary>
              <div className="mt-3.5 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-9">
                <p>{faq.a}</p>
              </div>
            </details>
          ))}
        </div>

        {/* Trust & Safety Incident Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold font-heading">
                Need to Report Suspicious Activity?
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                If you encounter a suspected scammer, extortion demand, or safety violation, notify our trust and safety review team immediately for priority intervention.
              </p>
            </div>
          </div>

          <a
            href="mailto:safety@findora.org?subject=Trust%20and%20Safety%20Incident%20Report"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-950 font-bold px-5 py-3 rounded-2xl text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Safety Team</span>
          </a>
        </div>
      </div>
    </section>
  );
}
