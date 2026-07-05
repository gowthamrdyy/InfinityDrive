import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-surface-0 flex justify-center py-12 px-6">
      <div className="max-w-3xl w-full glass-panel rounded-3xl p-10 relative">
        <Link 
          href="/" 
          className="absolute top-8 left-8 text-text-secondary hover:text-accent transition-colors text-sm font-medium"
        >
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-text-primary mb-2 mt-8">Terms of Service</h1>
        <p className="text-text-secondary mb-8 text-sm">Last updated: July 2026</p>

        <div className="space-y-6 text-text-secondary text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using InfinityDrive, you accept and agree to be bound by the terms and provision 
              of this agreement. If you do not agree to abide by these terms, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">2. Description of Service</h2>
            <p>
              InfinityDrive provides an aggregated dashboard and file management interface for users with multiple 
              Google Drive accounts. We do not provide cloud storage ourselves; we merely facilitate interactions 
              with your existing Google Drive storage using the official Google Drive APIs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">3. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials. You agree to use 
              InfinityDrive only for lawful purposes and in accordance with Google's own Terms of Service regarding 
              Google Drive usage. You may not use our service to distribute illegal or unauthorized content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">4. Disclaimer of Warranties</h2>
            <p>
              The service is provided on an "as is" and "as available" basis without any warranties of any kind. 
              InfinityDrive does not guarantee that the service will be uninterrupted or error-free. We are not 
              responsible for any data loss that may occur within your Google Drive accounts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">5. Limitation of Liability</h2>
            <p>
              In no event shall InfinityDrive be liable for any indirect, incidental, special, consequential, or 
              punitive damages, including without limitation, loss of profits, data, use, goodwill, or other 
              intangible losses resulting from your access to or use of or inability to access or use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">6. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. We will provide notice of any 
              significant changes. Your continued use of the service after any such changes constitutes your 
              acceptance of the new Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
