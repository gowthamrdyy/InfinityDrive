import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface-0 flex justify-center py-12 px-6">
      <div className="max-w-3xl w-full glass-panel rounded-3xl p-10 relative">
        <Link 
          href="/" 
          className="absolute top-8 left-8 text-text-secondary hover:text-accent transition-colors text-sm font-medium"
        >
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-text-primary mb-2 mt-8">Privacy Policy</h1>
        <p className="text-text-secondary mb-8 text-sm">Last updated: July 2026</p>

        <div className="space-y-6 text-text-secondary text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">1. Information We Collect</h2>
            <p>
              When you use InfinityDrive, we collect information that you voluntarily provide to us, 
              including your Google Account email address, basic profile information (such as your name and profile picture), 
              and OAuth authentication tokens required to access your Google Drive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">2. How We Use Your Information</h2>
            <p>
              We use your Google OAuth tokens strictly to interact with the Google Drive API on your behalf. 
              This includes fetching file lists, checking storage quotas, and facilitating file transfers between 
              your connected Google accounts. We do not use your data for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">3. Data Security and Encryption</h2>
            <p>
              Security is our highest priority. The refresh tokens for your linked accounts are encrypted using 
              industry-standard AES-256-GCM encryption before being stored in our database. We employ strict 
              access controls and never share your tokens or file data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">4. Google API Services User Data Policy</h2>
            <p>
              InfinityDrive's use and transfer to any other app of information received from Google APIs will adhere to 
              <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-accent hover:underline ml-1" target="_blank" rel="noreferrer">
                Google API Services User Data Policy
              </a>, including the Limited Use requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-3">5. Your Rights</h2>
            <p>
              You have the right to revoke InfinityDrive's access to your Google accounts at any time by visiting your 
              Google Account security settings. Furthermore, you can instantly remove linked accounts and delete your data 
              from our servers using the InfinityDrive dashboard.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
