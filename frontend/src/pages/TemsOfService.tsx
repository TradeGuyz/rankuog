import { useNavigate } from 'react-router-dom'
import { FiChevronLeft } from 'react-icons/fi'

const EFFECTIVE_DATE = 'March 30, 2025'

interface Section {
  title: string
  content: (string | { heading: string; body: string })[]
}

const sections: Section[] = [
  {
    title: 'Acceptance of Terms',
    content: [
      'By accessing or using RankUoG ("the Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform.',
      'These Terms apply to all visitors, registered users, and anyone who accesses or uses the Platform.',
    ],
  },
  {
    title: 'Eligibility',
    content: [
      'The Platform is intended solely for current and former students of the University of Guyana. By creating an account, you represent and warrant that:',
      {
        heading: 'You are or were enrolled at the University of Guyana',
        body: 'Access is limited to students with a valid University of Guyana student ID. We reserve the right to remove accounts that cannot be verified.',
      },
      {
        heading: 'You are at least 16 years of age',
        body: 'If you are under 16, you may not create an account or submit data to the Platform.',
      },
      {
        heading: 'Your information is accurate',
        body: 'You agree to provide truthful student ID and enrolment information at registration. Misrepresenting your identity or affiliation is a violation of these Terms.',
      },
    ],
  },
  {
    title: 'User Accounts',
    content: [
      'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.',
      {
        heading: 'Account creation',
        body: 'Accounts are created via Google OAuth or email magic link through Supabase Auth. You may not create accounts on behalf of others or share your account with another person.',
      },
      {
        heading: 'Display name',
        body: 'You may choose any display name that does not impersonate another person, include offensive language, or mislead other users about your identity.',
      },
      {
        heading: 'Account termination',
        body: 'You may delete your account at any time from your Profile page. We may also suspend or terminate accounts that violate these Terms, with or without prior notice.',
      },
    ],
  },
  {
    title: 'GPA Data & Accuracy',
    content: [
      'All GPA data on the Platform is self-reported by users. RankUoG does not independently verify, validate, or certify any GPA or academic information submitted.',
      {
        heading: 'Self-reported data',
        body: 'By submitting your GPA, you confirm it accurately reflects your official academic record as issued by the University of Guyana. Intentionally submitting false or inflated GPA data is a violation of these Terms and may result in account removal.',
      },
      {
        heading: 'No official affiliation',
        body: 'RankUoG is not affiliated with, endorsed by, or operated by the University of Guyana. Rankings displayed on this Platform have no official academic standing.',
      },
      {
        heading: 'Data changes',
        body: 'You may update your GPA at any time. Historical GPA entries are stored per academic year. Rankings are recalculated in real time based on current submissions.',
      },
    ],
  },
  {
    title: 'Privacy & Anonymity',
    content: [
      'We respect your right to privacy. The following options are available to all registered users:',
      {
        heading: 'Anonymous mode',
        body: 'When anonymous mode is enabled, your display name is hidden from the public leaderboard. Your ranking position remains visible, but you are identified only as "Anonymous". You can toggle this at any time from your Profile page.',
      },
      {
        heading: 'Data we collect',
        body: 'We collect your email address (via authentication provider), display name, student ID, department, enrolment year, and self-reported GPA data. We do not collect payment information, precise location, or any biometric data.',
      },
      {
        heading: 'Data sharing',
        body: 'We do not sell your personal data to third parties. Aggregated, anonymised statistics (e.g. average GPA by department) may be displayed publicly. Individual data is only visible according to your privacy settings.',
      },
    ],
  },
  {
    title: 'Prohibited Conduct',
    content: [
      'You agree not to engage in any of the following:',
      {
        heading: 'Submitting false academic data',
        body: 'Knowingly submitting inaccurate GPA values, fake student IDs, or false department or year information undermines the integrity of the Platform and is strictly prohibited.',
      },
      {
        heading: 'Harassment or abuse',
        body: 'Using the Platform to harass, bully, or demean other students — including through display names or public-facing content — is prohibited.',
      },
      {
        heading: 'Automated access',
        body: 'Scraping, crawling, or using bots or automated scripts to access or extract data from the Platform without prior written permission is prohibited.',
      },
      {
        heading: 'Circumventing security',
        body: 'Attempting to bypass authentication, exploit vulnerabilities, or interfere with the integrity or availability of the Platform is prohibited and may be reported to relevant authorities.',
      },
      {
        heading: 'Impersonation',
        body: 'Creating an account or display name that impersonates another student, staff member, or public figure is prohibited.',
      },
    ],
  },
  {
    title: 'Intellectual Property',
    content: [
      'All design, branding, code, and original content on the Platform — including the RankUoG name and logo — are owned by or licensed to us. You may not reproduce, redistribute, or create derivative works without explicit written consent.',
      'GPA data you submit remains yours. By submitting it, you grant us a limited, non-exclusive licence to display and aggregate it on the Platform in accordance with your privacy settings.',
    ],
  },
  {
    title: 'Disclaimers & Limitation of Liability',
    content: [
      'The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied.',
      {
        heading: 'No guarantee of accuracy',
        body: 'We make no representations about the accuracy, completeness, or reliability of any rankings or GPA data displayed, as all data is user-submitted.',
      },
      {
        heading: 'No liability for decisions',
        body: 'Rankings on this Platform should not be used to make academic, employment, or any other consequential decisions. We are not liable for any harm arising from reliance on Platform data.',
      },
      {
        heading: 'Service availability',
        body: 'We do not guarantee uninterrupted or error-free access to the Platform. We may modify, suspend, or discontinue the Platform at any time without liability.',
      },
      {
        heading: 'Limitation of liability',
        body: 'To the maximum extent permitted by law, RankUoG and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.',
      },
    ],
  },
  {
    title: 'Changes to These Terms',
    content: [
      'We may update these Terms from time to time. When we do, we will update the "Effective Date" at the top of this page. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Terms.',
      'For significant changes, we will make reasonable efforts to notify registered users via email or an in-app notice.',
    ],
  },
  {
    title: 'Governing Law',
    content: [
      'These Terms are governed by and construed in accordance with the laws of the Co-operative Republic of Guyana. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of Guyana.',
    ],
  },
  {
    title: 'Contact',
    content: [
      'If you have questions about these Terms or wish to report a violation, you can reach us through the platform\'s official channels. RankUoG is managed and maintained by TradeGuyz. We aim to respond to all inquiries within 5 business days.',
    ],
  },
]

export default function TermsOfService() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-[1000px] mx-auto px-6 py-10">

        {/* Back */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer mb-10"
        >
          <FiChevronLeft size={16} />
          Back to leaderboard
        </button>

        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/40 mb-3">Legal</p>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>
            Terms of Service
          </h1>
          <p className="text-sm text-white/40 mt-2">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        {/* Intro callout */}
        <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-lg px-5 py-4 mb-10">
          <p className="text-sm text-white/70 leading-relaxed">
            Please read these Terms carefully before using RankUoG. By creating an account or
            browsing the Platform, you agree to these Terms. If you disagree with any part,
            you should not use the Platform.
          </p>
          <p className="text-sm text-white/40 leading-relaxed mt-2">
            RankUoG is managed and maintained by <span className="text-white/60 font-semibold">TradeGuyz</span>.
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-8">
          {sections.map((section, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-lg px-6 py-5">
              <div className="flex items-start gap-4 mb-4">
                <span className="font-mono text-[11px] text-[#d4af37] mt-0.5 select-none w-5 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="text-base font-bold text-white">{section.title}</h2>
              </div>

              <div className="flex flex-col gap-4 pl-9">
                {section.content.map((item, j) =>
                  typeof item === 'string' ? (
                    <p key={j} className="text-sm text-white/60 leading-relaxed">
                      {item}
                    </p>
                  ) : (
                    <div key={j}>
                      <p className="text-sm font-semibold text-white/80 mb-1">{item.heading}</p>
                      <p className="text-sm text-white/50 leading-relaxed">{item.body}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-xs text-white/20 text-center mt-12 mb-4">
          RankUoG is an independent platform managed and maintained by TradeGuyz. Not affiliated with the University of Guyana.
        </p>
      </div>
    </div>
  )
}
