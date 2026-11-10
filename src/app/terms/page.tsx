import Link from "next/link";
import { getMergedCompanyInfo } from "@/app/actions/settings";
import { pageMetadata } from "@/lib/seo";
import TermsToc from "./TermsToc";

export const metadata = pageMetadata({
  title: "Terms of Service",
  description:
    "The terms that govern your use of the Realty Flux website, property listings, enquiries and viewing bookings.",
  path: "/terms",
});

const LAST_UPDATED = "7 October 2026";

const SECTIONS = [
  { id: "acceptance", title: "Acceptance of these terms" },
  { id: "definitions", title: "Definitions" },
  { id: "use", title: "Using our website" },
  { id: "listings", title: "Property listings" },
  { id: "viewings", title: "Enquiries and viewings" },
  { id: "payments", title: "Fees, deposits and payments" },
  { id: "third-parties", title: "Owners, landlords and third parties" },
  { id: "conduct", title: "Acceptable use" },
  { id: "ip", title: "Intellectual property" },
  { id: "privacy", title: "Privacy and your data" },
  { id: "disclaimers", title: "Disclaimers" },
  { id: "liability", title: "Limitation of liability" },
  { id: "indemnity", title: "Indemnity" },
  { id: "links", title: "Links to other websites" },
  { id: "changes", title: "Changes to these terms" },
  { id: "law", title: "Governing law and disputes" },
  { id: "contact", title: "Contact us" },
];

export default async function TermsPage() {
  const company = await getMergedCompanyInfo();
  const name = company.name;

  return (
    <div className="legal-page">
      {/* Banner */}
      <div className="legal-banner">
        <div className="container-custom">
          <span data-reveal="fade" className="legal-banner__label">
            Legal
          </span>
          <h1 data-split className="legal-banner__title">
            Terms of Service
          </h1>
          <p data-reveal data-reveal-delay="0.15" className="legal-banner__meta">
            Last updated: {LAST_UPDATED}
          </p>
        </div>
      </div>

      <div className="container-custom legal-layout">
        <aside className="legal-layout__aside">
          <TermsToc sections={SECTIONS.map(({ id, title }) => ({ id, title }))} />
        </aside>

        <article className="legal-content" data-reveal>
          <p className="legal-lead">
            Please read these Terms of Service carefully. They set out the rules for using the{" "}
            {name} website and the services we offer through it, including browsing property
            listings, sending enquiries and requesting viewings.
          </p>

          <section id="acceptance">
            <h2>1. Acceptance of these terms</h2>
            <p>
              By accessing or using this website you agree to be bound by these Terms of Service.
              If you do not agree, please do not use the website.
            </p>
            <p>
              These terms apply to all visitors and users. Where you enter into a separate
              written agreement with us, for example a sale, letting or management mandate, that
              agreement will prevail over these terms to the extent of any conflict.
            </p>
          </section>

          <section id="definitions">
            <h2>2. Definitions</h2>
            <ul>
              <li>
                <strong>&ldquo;{name}&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;</strong>{" "}
                means {name}, the operator of this website.
              </li>
              <li>
                <strong>&ldquo;You&rdquo;, &ldquo;your&rdquo;</strong> means any person who
                accesses or uses the website.
              </li>
              <li>
                <strong>&ldquo;Listing&rdquo;</strong> means any property information, image,
                video, price or description published on the website.
              </li>
              <li>
                <strong>&ldquo;Owner&rdquo;</strong> means the seller, landlord or other person
                on whose behalf a property is marketed.
              </li>
              <li>
                <strong>&ldquo;Services&rdquo;</strong> means the website and the enquiry,
                viewing and related services we provide through it.
              </li>
            </ul>
          </section>

          <section id="use">
            <h2>3. Using our website</h2>
            <p>
              You must be at least 18 years old to submit an enquiry or viewing request. By
              doing so you confirm that the information you provide is accurate, complete and
              your own.
            </p>
            <p>
              We grant you a limited, non-exclusive, non-transferable right to use the website
              for your personal, non-commercial purposes of finding, buying, selling or renting
              property. We may suspend, restrict or withdraw access to all or part of the website
              at any time, without notice, for maintenance, security or any other reason.
            </p>
          </section>

          <section id="listings">
            <h2>4. Property listings</h2>
            <p>
              We take reasonable care to keep listings accurate and up to date. However, listings
              are prepared from information supplied by Owners and other sources and are provided
              for general guidance only. In particular:
            </p>
            <ul>
              <li>
                Prices, sizes, room counts, amenities and availability are indicative and may
                change without notice.
              </li>
              <li>
                Photographs, videos, floor plans and illustrations may be representative and
                may not show the current condition of the property.
              </li>
              <li>
                A listing is an invitation to make enquiries, not an offer capable of
                acceptance. No contract arises until a written agreement is signed by all parties.
              </li>
              <li>
                A property shown as available may already be under offer, sold or let.
              </li>
            </ul>
            <p>
              Before committing to any transaction you should carry out your own checks,
              including inspecting the property, conducting an official search of the title at
              the relevant land registry, confirming planning and approval status, and obtaining
              independent legal, valuation and survey advice.
            </p>
          </section>

          <section id="viewings">
            <h2>5. Enquiries and viewings</h2>
            <p>
              Submitting an enquiry or a viewing request through the website does not guarantee
              a viewing. A viewing is confirmed only when one of our agents confirms the date and
              time with you directly.
            </p>
            <ul>
              <li>
                Please arrive on time and bring a valid form of identification. We may ask to
                verify your identity before a viewing.
              </li>
              <li>
                If you need to cancel or reschedule, please let us know as early as possible.
              </li>
              <li>
                You are responsible for your own safety and conduct during a viewing and must
                follow the reasonable instructions of our agents and the Owner.
              </li>
              <li>
                We may decline, reschedule or cancel a viewing at our discretion, including at
                the request of the Owner.
              </li>
            </ul>
          </section>

          <section id="payments">
            <h2>6. Fees, deposits and payments</h2>
            <p>
              We do not take payments through this website. Any fee, deposit, booking amount or
              purchase price will be set out in a written agreement and paid only through the
              official channels stated in that agreement.
            </p>
            <div className="legal-callout" role="note">
              <strong>Protect yourself from fraud.</strong> {name}{" "}will never ask you to send
              money to a personal bank account or a personal mobile money number, or to pay
              before a viewing. If you receive such a request, do not pay. Contact us
              immediately using the details in the &ldquo;Contact us&rdquo; section to verify it.
            </div>
            <p>
              We are not responsible for any loss arising from payments made outside our
              official, documented payment channels.
            </p>
          </section>

          <section id="third-parties">
            <h2>7. Owners, landlords and third parties</h2>
            <p>
              Unless we expressly state otherwise, we act as an intermediary between you and the
              Owner. Any sale or tenancy agreement will be between you and the Owner. We are not
              a party to that agreement and do not guarantee the performance of either party.
            </p>
            <p>
              We may introduce you to third-party service providers such as lawyers, valuers,
              surveyors, movers or financiers. Those providers are independent of us, and your
              dealings with them are governed by their own terms.
            </p>
          </section>

          <section id="conduct">
            <h2>8. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>use the website for any unlawful, fraudulent or misleading purpose;</li>
              <li>submit false enquiries, or enquiries in another person&rsquo;s name;</li>
              <li>
                copy, scrape, harvest or republish listings or contact details by automated
                means without our written consent;
              </li>
              <li>
                attempt to gain unauthorised access to the website, our systems or our
                administration area, or interfere with their security or operation;
              </li>
              <li>upload or transmit viruses or any other harmful code;</li>
              <li>harass, abuse or threaten our staff, Owners or other users.</li>
            </ul>
          </section>

          <section id="ip">
            <h2>9. Intellectual property</h2>
            <p>
              The website and its content, including text, photographs, videos, graphics, logos,
              the {name} name and the overall design, are owned by or licensed to {name} and are
              protected by copyright, trade mark and other intellectual property laws.
            </p>
            <p>
              You may view and print pages for your personal use. You may not reproduce,
              distribute, modify or commercially exploit any content without our prior written
              permission.
            </p>
          </section>

          <section id="privacy">
            <h2>10. Privacy and your data</h2>
            <p>
              When you contact us, submit an enquiry or request a viewing, we collect personal
              data such as your name, email address, phone number and message. We use it to
              respond to you, arrange viewings, share your enquiry with the relevant Owner where
              necessary, and improve our services.
            </p>
            <p>
              We process personal data in accordance with the Data Protection Act, 2019 of Kenya.
              You may request access to, correction of, or deletion of your personal data at any
              time by contacting us. We do not sell your personal data.
            </p>
          </section>

          <section id="disclaimers">
            <h2>11. Disclaimers</h2>
            <p>
              The website and its content are provided on an &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; basis. To the fullest extent permitted by law, we make no warranty
              that the website will be uninterrupted, error-free or free of viruses, or that any
              listing is accurate, complete or current.
            </p>
            <p>
              Nothing on the website is legal, financial, tax or investment advice. Property
              values can go down as well as up, and you should take independent professional
              advice before making any decision.
            </p>
          </section>

          <section id="liability">
            <h2>12. Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, {name} will not be liable for any indirect,
              incidental, special or consequential loss, or for any loss of profit, revenue,
              opportunity or data, arising from your use of, or inability to use, the website or
              your reliance on any listing.
            </p>
            <p>
              Nothing in these terms excludes or limits any liability that cannot be excluded or
              limited under the laws of Kenya, including liability for fraud or for death or
              personal injury caused by negligence.
            </p>
          </section>

          <section id="indemnity">
            <h2>13. Indemnity</h2>
            <p>
              You agree to indemnify {name} and its staff against any claim, loss or expense,
              including reasonable legal fees, arising from your breach of these terms or your
              misuse of the website.
            </p>
          </section>

          <section id="links">
            <h2>14. Links to other websites</h2>
            <p>
              The website may contain links to third-party websites, including maps and social
              media. We do not control those websites and are not responsible for their content,
              availability or privacy practices.
            </p>
          </section>

          <section id="changes">
            <h2>15. Changes to these terms</h2>
            <p>
              We may update these terms from time to time. The &ldquo;Last updated&rdquo; date at
              the top of this page shows when they were last revised. Your continued use of the
              website after changes are published means you accept the updated terms.
            </p>
          </section>

          <section id="law">
            <h2>16. Governing law and disputes</h2>
            <p>
              These terms are governed by the laws of the Republic of Kenya. We encourage you to
              contact us first so that we can try to resolve any concern informally. Any dispute
              that cannot be resolved this way will be subject to the jurisdiction of the courts
              of Kenya.
            </p>
            <p>
              If any provision of these terms is found to be invalid or unenforceable, the
              remaining provisions will continue in full force.
            </p>
          </section>

          <section id="contact">
            <h2>17. Contact us</h2>
            <p>If you have any questions about these terms, please get in touch:</p>
            <dl className="legal-contact">
              <div>
                <dt>Company</dt>
                <dd>{name}</dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{company.address}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${company.email}`}>{company.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${company.phone.replace(/\s+/g, "")}`}>{company.phone}</a>
                </dd>
              </div>
            </dl>
            <p>
              You can also reach us through our <Link href="/contact">contact page</Link>.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
