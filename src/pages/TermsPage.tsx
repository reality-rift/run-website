import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Acceptance of Terms',
    content:
      'By accessing or using the SPORTARCH platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the platform. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of any changes.',
  },
  {
    title: 'Account Registration',
    content:
      'To access certain features, you must create an account with accurate and complete information. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use.',
  },
  {
    title: 'Event Listings',
    content:
      'Event organizers are responsible for the accuracy of their event listings, including dates, locations, pricing, and descriptions. SPORTARCH serves as a discovery platform and does not organize, manage, or guarantee any listed events. Registration for events is between you and the event organizer.',
  },
  {
    title: 'User Conduct',
    content:
      'You agree not to use the platform for any unlawful purpose, to post false or misleading event information, to harass other users, or to attempt to circumvent any security measures. We reserve the right to suspend or terminate accounts that violate these guidelines.',
  },
  {
    title: 'Intellectual Property',
    content:
      'All content on the SPORTARCH platform, including logos, design, text, and software, is owned by SPORTARCH or its licensors and is protected by intellectual property laws. Event images and descriptions remain the property of their respective organizers.',
  },
  {
    title: 'Limitation of Liability',
    content:
      'SPORTARCH is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform, including but not limited to event cancellations, changes, or disputes with event organizers.',
  },
  {
    title: 'Platform Usage',
    content:
      'SPORTARCH is a free platform for discovering and registering for running and cycling events. Event entry fees are set by and paid directly to event organizers. SPORTARCH does not process payments or charge fees for platform access. Organizers are responsible for their own pricing and payment collection.',
  },
  {
    title: 'Governing Law',
    content:
      'These terms are governed by applicable laws. Any disputes arising from these terms or your use of the platform shall be resolved through binding arbitration in accordance with standard arbitration rules, unless otherwise agreed upon by both parties.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface pt-24 pb-24">
      <div className="px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
            <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-accent mb-4">
              Legal
            </span>
            <h1 className="font-playfair text-4xl md:text-6xl text-[#F5F5F0] leading-[0.95] tracking-[-0.03em] mb-6">
              Terms of <span className="italic font-normal text-white/50">Service</span>
            </h1>
            <p className="font-inter text-white/40 text-sm">
              Last updated: February 2026
            </p>
          </div>

          <div className="mb-12">
            <p className="font-inter text-white/60 leading-relaxed text-lg">
              Welcome to SPORTARCH. These terms govern your use of our platform and
              services. Please read them carefully before creating an account or using any
              features.
            </p>
          </div>

          <div className="space-y-10">
            {sections.map((section, i) => (
              <div key={section.title} className="group">
                <div className="flex items-start gap-4">
                  <span className="font-syne font-bold text-2xl text-accent/30 shrink-0 w-8">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h2 className="font-syne font-bold text-xl text-[#F5F5F0] mb-3">
                      {section.title}
                    </h2>
                    <p className="font-inter text-sm text-white/50 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
                {i < sections.length - 1 && (
                  <div className="h-px bg-white/5 mt-10" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 glass rounded-2xl p-8 text-center">
            <p className="font-inter text-white/40 text-sm mb-4">
              Questions about these terms?
            </p>
            <Link
              to="/editorial"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-black font-syne font-bold text-sm uppercase rounded-full hover:brightness-110 transition-all active:scale-95"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
