'use client';

import {
  Scale, Truck, Lock, Gavel, RefreshCw,
  ChevronRight, Mail, Bell, MapPin, Shield, Phone, LucideIcon
} from 'lucide-react';
import Link from 'next/link';

interface TermsSection {
  icon: LucideIcon;
  title: string;
  content: React.ReactNode;
}

interface PolicyLink {
  title: string;
  description: string;
  link: string;
  icon: LucideIcon;
}

const termsSections: TermsSection[] = [
  {
    icon: Scale,
    title: 'Product Descriptions & Pricing',
    content: (
      <p className="text-sm text-gray-600 leading-relaxed">
        All product descriptions, images, and prices are subject to change without notice. We strive to provide accurate information, but specifications may vary slightly based on manufacturer updates or stock availability.
      </p>
    ),
  },
  {
    icon: Lock,
    title: 'Payment & Order Processing',
    content: (
      <p className="text-sm text-gray-600 leading-relaxed">
        Payments must be successfully completed before order verification and dispatch, except for orders placed under the approved Cash on Delivery (COD) option. We accept UPI, Cards, Wallets, Net Banking, and COD for your convenience.
      </p>
    ),
  },
  {
    icon: Truck,
    title: 'Shipping & Delivery',
    content: (
      <p className="text-sm text-gray-600 leading-relaxed">
        We are not responsible for delays caused by courier services or incorrect shipping details provided by customers. Please ensure your delivery address is accurate and complete at the time of checkout. Estimated delivery: 2–7 business days across India.
      </p>
    ),
  },
  {
    icon: RefreshCw,
    title: 'Returns & Quality Assurance (7-Day Policy)',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-gray-600 leading-relaxed">
          Returns and replacements apply strictly to items verified as defective or damaged due to manufacturing faults, reported within{' '}
          <span className="font-semibold text-[#ff3131]">7 days of delivery</span> with valid proof or documented evidence.
        </p>
        <ul className="space-y-2">
          {[
            'Manufacturing defects must be reported within 7 days with photographic evidence',
            'Product must be unused and in original packaging with all accessories',
            'Damage during shipping must be reported immediately upon delivery',
            'Returns due to incorrect product selection or buyer remorse are not accepted',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 bg-[#ff3131] rounded-full flex-shrink-0 mt-2" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    icon: Shield,
    title: 'Warranty & Replacement Policy',
    content: (
      <p className="text-sm text-gray-600 leading-relaxed">
        Warranty-related concerns, where applicable, will be processed solely as per the official Warranty & Replacement Policy and under the terms and limitations stated therein. Please refer to our detailed warranty documentation for specific coverage details.
      </p>
    ),
  },
  {
    icon: Scale,
    title: 'Intellectual Property Rights',
    content: (
      <p className="text-sm text-gray-600 leading-relaxed">
        All creative assets, including brand logos, product visuals, digital content, and layout designs, are the intellectual property of KD Book Bazaar or their rightful owners. Any unauthorized use, reproduction, or distribution constitutes a legal violation and may invite immediate legal proceedings.
      </p>
    ),
  },
  {
    icon: RefreshCw,
    title: 'Amendments to Terms',
    content: (
      <p className="text-sm text-gray-600 leading-relaxed">
        We reserve the right to update these terms anytime without prior notice. Continued use of our website or services after such modifications constitutes acceptance of the updated terms.
      </p>
    ),
  },
  {
    icon: Phone,
    title: 'Order Verification & Authentication',
    content: (
      <p className="text-sm text-gray-600 leading-relaxed">
        To ensure authenticity and prevent fraud, we may verify orders through SMS or email. This verification process helps us confirm your purchase intent and delivery details.
      </p>
    ),
  },
  {
    icon: Bell,
    title: 'Communication Consent & DND Override',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-gray-600 leading-relaxed">
          By providing your phone number and placing orders, you authorize us to override the Do-Not-Disturb (DND) registry for communications regarding:
        </p>
        <ul className="space-y-2">
          {[
            'Order confirmations and delivery updates',
            'Exclusive product launches and offers',
            'Customer service communications',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 bg-[#ff3131] rounded-full flex-shrink-0 mt-2" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    icon: Gavel,
    title: 'Jurisdiction & Governing Law',
    content: (
      <p className="text-sm text-gray-600 leading-relaxed">
        These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
      </p>
    ),
  },
];

const relatedPolicies: PolicyLink[] = [
  {
    title: 'Return & Refund Policy',
    description: 'Learn about our hassle-free return process and refund guidelines.',
    link: '/returns-and-refunds-policy',
    icon: RefreshCw,
  },
  {
    title: 'Shipping Policy',
    description: 'Understand our delivery timelines and shipping procedures.',
    link: '/shipping-policy',
    icon: Truck,
  },
  {
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
    link: '/privacy-policy',
    icon: Shield,
  },
  {
    title: 'Cancellation Policy',
    description: 'Learn when and how you can cancel an order on KD Book Bazaar.',
    link: '/cancellation-policy',
    icon: Scale,
  },
];

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── HERO ── */}
      <section className="bg-[#1a1a1a] py-14 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-5">
            <Scale className="w-3.5 h-3.5 text-[#ff3131]" />
            <span className="text-xs font-semibold text-orange-200 uppercase tracking-wider">Legal Agreement</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed max-w-2xl">
            Welcome to KD Book Bazaar. By using our platform or making a purchase, you agree to the terms and conditions that govern your use of our services.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            By engaging with our website at{' '}
            <a href="https://www.kdbookbazaar.com" className="text-[#ff3131] font-medium hover:underline">
              www.kdbookbazaar.com
            </a>{' '}
            or making a purchase, you acknowledge, understand, and accept the terms and conditions that govern your use of our services. Please read these carefully before proceeding.
          </p>
        </div>

        {/* Terms Sections */}
        {termsSections.map((section, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-[#ff3131]/20 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <section.icon className="w-5 h-5 text-[#ff3131]" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                  {index + 1}. {section.title}
                </h2>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                  {section.content}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Contact — Section 11 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-[#ff3131]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-1 uppercase tracking-wide">
                11. Contact & Customer Support
              </h2>
              <p className="text-sm text-gray-500">For questions or concerns related to these Terms:</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-1 gap-4 max-w-sm">
            <a
              href="mailto:support@kdbookbazaar.com"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#ff3131]/30 hover:bg-red-50/30 transition-all duration-200 group"
            >
              <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-[#ff3131] transition-colors">
                <Mail className="w-4 h-4 text-[#ff3131] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold text-gray-900">support@kdbookbazaar.com</p>
              </div>
            </a>
          </div>

          <div className="mt-4 flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-[#ff3131]" />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Office Address</p>
              <address className="text-sm text-gray-700 not-italic leading-relaxed">
                KD Book Bazaar, Sector 15, Rohini<br />
                New Delhi, Delhi 110089, India
              </address>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Response Time: Within 24 hours &nbsp;·&nbsp; Available: Monday–Saturday, 10 AM–7 PM IST
          </p>
        </div>

        {/* Closing Statement */}
        <div className="bg-[#1a1a1a] rounded-2xl p-7 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff3131]/10 rounded-full blur-3xl pointer-events-none" />
          <p className="relative z-10 text-sm text-blue-200 leading-relaxed max-w-2xl mx-auto">
            By using the KD Book Bazaar website, you acknowledge that you have{' '}
            <span className="text-white font-semibold">read, understood, and agreed</span>{' '}
            to these Terms & Conditions. If you do not agree, please discontinue use of our platform.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
          <h3 className="text-base font-bold text-gray-900 mb-1">Questions About Our Terms?</h3>
          <p className="text-sm text-gray-500 mb-5">Our support team is happy to clarify anything.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:support@kdbookbazaar.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ff3131] hover:bg-[#cc0000] text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all shadow-md"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white rounded-xl text-sm font-bold uppercase tracking-wide transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Related Policies */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-1">Related Policies</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {relatedPolicies.map((policy, index) => (
              <Link
                key={index}
                href={policy.link}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-[#ff3131]/20 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#ff3131] transition-colors duration-300">
                    <policy.icon className="w-5 h-5 text-[#ff3131] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-[#ff3131] transition-colors">
                      {policy.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-2">{policy.description}</p>
                    <div className="flex items-center gap-1 text-[#ff3131] text-xs font-semibold">
                      Read More
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">
          © {new Date().getFullYear()} KD Book Bazaar. All rights reserved. &nbsp;·&nbsp;{' '}
          <Link href="/privacy-policy" className="text-[#ff3131] hover:underline">Privacy Policy</Link>
          {' '}&nbsp;·&nbsp;{' '}
          <Link href="/disclaimer" className="text-[#ff3131] hover:underline">Disclaimer</Link>
        </p>
      </div>
    </main>
  );
}
