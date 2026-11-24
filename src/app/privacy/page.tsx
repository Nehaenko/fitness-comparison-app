import type { Metadata } from "next";

import LegalPageShell from "@/components/legal/legalPageShell";

export const metadata: Metadata = {
  title: "Privacy policy — Forma",
  description: "How Forma collects, uses, stores, and protects personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy policy"
      description="This policy explains how Forma handles your personal data when you use the website or installable web app."
      updatedOn="24 November 2026"
    >
      <section>
        <h2>Who is responsible for your data?</h2>
        <p>
          Forma is operated by Alla Nekhaienko, who is the data controller for
          personal data processed through the app. For privacy questions or
          requests, email{" "}
          <a href="mailto:nekhaienko.alla@gmail.com">
            nekhaienko.alla@gmail.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Data Forma collects</h2>
        <ul>
          <li>
            <strong>Account data:</strong> your name, email address, Google
            profile image, authentication account identifiers, and session
            information when you sign in with Google.
          </li>
          <li>
            <strong>Profile settings:</strong> your display name and preferred
            weight and measurement units.
          </li>
          <li>
            <strong>Fitness data:</strong> routines, workouts, exercises,
            completed sets, repetitions, weights, rest periods, workout history,
            and custom exercises.
          </li>
          <li>
            <strong>Body and progress data:</strong> measurements you choose to
            record, including weight and body measurements, progress dates, and
            progress photos you choose to upload.
          </li>
          <li>
            <strong>Device data:</strong> essential technical information needed
            to deliver and secure the service, such as server requests,
            authentication cookies, and error or security logs produced by the
            hosting and authentication services.
          </li>
        </ul>
        <p>
          Forma does not currently use advertising trackers or sell personal
          data.
        </p>
      </section>

      <section>
        <h2>How and why data is used</h2>
        <p>Forma uses personal data to:</p>
        <ul>
          <li>authenticate you and keep your account secure;</li>
          <li>save and display your routines, workouts, measurements, and photos;</li>
          <li>provide progress and photo-comparison features;</li>
          <li>remember your preferences and active workout state;</li>
          <li>operate, troubleshoot, and protect the service; and</li>
          <li>respond to support, access, or deletion requests.</li>
        </ul>
        <p>
          The main legal basis is providing the service you request. Forma also
          relies on legitimate interests to keep the app reliable and secure.
          Where permission or consent is required, including for device access
          or information treated as health data under applicable law, you may
          withdraw it at any time by stopping the relevant use, changing device
          permissions, deleting the information, or contacting the address
          above.
        </p>
      </section>

      <section>
        <h2>Prototype mode and local storage</h2>
        <p>
          Prototype mode does not require an account. Prototype workouts and
          changes are stored only in your browser&apos;s local storage. Forma also
          stores your theme choice and may temporarily store an active workout
          on your device. You can remove this information by resetting prototype
          mode or clearing Forma&apos;s site data in your browser.
        </p>
      </section>

      <section>
        <h2>Service providers</h2>
        <p>
          Forma uses trusted providers only as needed to run the app:
        </p>
        <ul>
          <li><strong>Google</strong> for account authentication;</li>
          <li><strong>Vercel</strong> for hosting and private progress-photo storage; and</li>
          <li><strong>Neon</strong> for the application database.</li>
        </ul>
        <p>
          These providers process data under their own contractual and security
          arrangements. Some processing may take place outside the United
          Kingdom. Where required, transfers are protected using an approved
          legal safeguard. Forma may also disclose information where required by
          law or necessary to protect users and the service.
        </p>
      </section>

      <section>
        <h2>Photo privacy and security</h2>
        <p>
          Progress photos are stored in private object storage. Access to an
          uploaded photo is checked against the signed-in user before it is
          served. Photos are not made public by Forma. No online service can
          promise absolute security, but access controls and reasonable
          technical measures are used to protect your information.
        </p>
      </section>

      <section>
        <h2>How long data is kept</h2>
        <p>
          Account and fitness data is kept while your account is active or until
          it is no longer needed to provide the service. Removing a progress
          entry also removes its active photo record and associated stored photo.
          You may request account deletion by email. Following a verified
          request, active account data and stored progress photos will be deleted
          or anonymised, except for limited information that must be retained for
          legal, security, or backup purposes.
        </p>
      </section>

      <section>
        <h2>Your privacy rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct,
          erase, restrict, object to, or receive a portable copy of your personal
          data, and to withdraw consent where processing relies on consent. Email
          the contact address above to make a request. Identity may need to be
          verified before a request is completed.
        </p>
        <p>
          If you are in the United Kingdom, you may also complain to the
          Information Commissioner&apos;s Office at{" "}
          <a href="https://ico.org.uk/make-a-complaint/" rel="noreferrer">
            ico.org.uk
          </a>
          . Please contact Forma first if you would like the issue investigated.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>
          Forma is not designed for children. If you believe a child has provided
          personal data without appropriate permission, contact Forma so it can
          be investigated and removed.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          This policy may be updated as Forma changes. The date at the top will
          be updated when material changes are made.
        </p>
      </section>
    </LegalPageShell>
  );
}
