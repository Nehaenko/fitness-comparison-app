import type { Metadata } from "next";

import LegalPageShell from "@/components/legal/legalPageShell";

export const metadata: Metadata = {
  title: "Terms of use — Forma",
  description: "The terms that apply when using Forma.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of use"
      description="These terms apply when you access or use the Forma website, prototype, or installable web app."
      updatedOn="24 November 2026"
    >
      <section>
        <h2>About Forma</h2>
        <p>
          Forma is a personal fitness-planning and progress-tracking service
          operated by Alla Nekhaienko. Questions about these terms can be sent to{" "}
          <a href="mailto:nekhaienko.alla@gmail.com">
            nekhaienko.alla@gmail.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Accepting these terms</h2>
        <p>
          By creating an account or using Forma, you agree to these terms. If you
          do not agree, do not use the service. If you are not legally able to
          agree to these terms yourself, you may use Forma only with permission
          and supervision from a parent or legal guardian.
        </p>
      </section>

      <section>
        <h2>Your account</h2>
        <p>
          You are responsible for access to your Google account and for activity
          carried out through your Forma account. Provide accurate information,
          keep your account secure, and notify Forma if you believe it has been
          accessed without permission. Account availability may be limited while
          Forma remains in private testing.
        </p>
      </section>

      <section>
        <h2>Fitness and health notice</h2>
        <p>
          Forma is a planning and record-keeping tool. It does not provide
          medical advice, diagnosis, treatment, or professional coaching. Check
          with a qualified healthcare professional before beginning or changing
          an exercise programme, particularly if you have an injury, health
          condition, or concern. Stop exercising and seek appropriate help if you
          feel pain, faintness, or other worrying symptoms. You remain
          responsible for deciding whether an activity is suitable and safe for
          you.
        </p>
      </section>

      <section>
        <h2>Your content</h2>
        <p>
          You keep ownership of information and photos you add to Forma. You give
          Forma a limited permission to host, store, process, display, and back up
          that content only as needed to operate and improve the service for you.
          You must have the right to upload the content and must not upload
          material that is unlawful, harmful, or violates another person&apos;s
          privacy or intellectual-property rights.
        </p>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>You must not:</p>
        <ul>
          <li>try to access another person&apos;s account or private data;</li>
          <li>circumvent access controls or probe the service for vulnerabilities;</li>
          <li>upload malicious code or use Forma to break the law;</li>
          <li>interfere with the app or place unreasonable load on its systems; or</li>
          <li>copy, resell, or exploit the service except where law permits it.</li>
        </ul>
      </section>

      <section>
        <h2>Prototype mode</h2>
        <p>
          Prototype mode is for evaluation. Its data is stored in the browser and
          may be lost when site data is cleared, the browser is reset, or the
          prototype changes. Do not rely on prototype mode as a permanent record.
        </p>
      </section>

      <section>
        <h2>Availability and changes</h2>
        <p>
          Forma may change, pause, or discontinue features, and uninterrupted or
          error-free availability is not guaranteed. Reasonable care will be
          taken when operating the service, but you should keep any records you
          cannot afford to lose. Material changes to these terms will be shown by
          updating the date above and, where appropriate, by giving additional
          notice.
        </p>
      </section>

      <section>
        <h2>Suspension and ending use</h2>
        <p>
          Access may be suspended or ended where reasonably necessary to protect
          Forma or its users, comply with law, or respond to a serious or repeated
          breach of these terms. You may stop using Forma at any time and may
          request account deletion by email.
        </p>
      </section>

      <section>
        <h2>Intellectual property</h2>
        <p>
          Forma&apos;s name, visual design, software, and original content are owned
          by Alla Nekhaienko or used with permission. Except for the limited right
          to use the app for personal purposes, no rights are transferred to you.
        </p>
      </section>

      <section>
        <h2>Responsibility</h2>
        <p>
          Nothing in these terms excludes rights or responsibilities that cannot
          legally be excluded, including applicable consumer rights. To the
          fullest extent permitted by law, Forma is not responsible for indirect
          or unforeseeable loss, loss caused by misuse of the service, or injury
          arising from exercise decisions that Forma did not direct. The service
          is provided for personal, non-commercial use.
        </p>
      </section>

      <section>
        <h2>Law</h2>
        <p>
          These terms are governed by the laws of England and Wales, without
          taking away any mandatory protections you have under the law where you
          live. Courts with jurisdiction under applicable law may hear disputes.
        </p>
      </section>
    </LegalPageShell>
  );
}
