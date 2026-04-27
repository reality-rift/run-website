import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Information We Collect',
    content:
      'We collect information you provide directly, including your name, email address, and event preferences when you create an account or register for events. We also collect usage data such as pages visited, events viewed, and search queries to improve your experience.',
  },
  {
    title: 'How We Use Your Information',
    content:
      'Your information is used to provide and personalize the SPORTSARCH platform, process event registrations, send relevant notifications about events you have saved or registered for, and improve our services. We never sell your personal data to third parties.',
  },
  {
    title: 'Data Storage & Security',
    content:
      'Your data is stored securely using industry-standard encryption and hosted on enterprise-grade infrastructure. We implement appropriate technical and organizational measures to protect against unauthorized access, alteration, or destruction of your personal information.',
  },
  {
    title: 'Cookies & Tracking',
    content:
      'We use essential cookies to maintain your session and preferences. Analytics cookies help us understand how the platform is used so we can improve it. You can manage your cookie preferences through your browser settings at any time.',
  },
  {
    title: 'Third-Party Services',
    content:
      'We integrate with third-party services for authentication, payment processing, and analytics. These services have their own privacy policies, and we encourage you to review them. We only share the minimum data necessary for these services to function.',
  },
  {
    title: 'Your Rights',
    content:
      'You have the right to access, correct, or delete your personal data at any time through your profile settings or by contacting our support team. You can also request a copy of all data we hold about you or ask us to stop processing your data.',
  },
  {
    title: 'Data Retention',
    content:
      'We retain your personal data for as long as your account is active or as needed to provide services. If you delete your account, we will remove your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.',
  },
  {
    title: 'Changes to This Policy',
    content:
      'We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "last updated" date. Your continued use of the platform constitutes acceptance of the updated policy.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface pt-24 pb-24">
      <div className="px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
            <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-accent mb-4">
              Legal
            </span>
            <h1 className="font-playfair text-4xl md:text-6xl text-[#F5F5F0] leading-[0.95] tracking-[-0.03em] mb-6">
              Privacy <span className="italic font-normal text-white/50">Policy</span>
            </h1>
            <p className="font-inter text-white/40 text-sm">
              Last updated: February 2026
            </p>
          </div>

          <div className="mb-12">
            <p className="font-inter text-white/60 leading-relaxed text-lg">
              At SPORTSARCH, we take your privacy seriously. This policy describes how we
              collect, use, and protect your personal information when you use our platform.
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
              Have questions about our privacy practices?
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
