import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white border-t py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 text-center md:text-left">
          {/* Company Section */}
          <div>
            <h3 className="text-xl font-bold text-finance-green mb-2">
              personifi
            </h3>
            <p className="text-muted-foreground mb-4">
              Personal finance for couples
            </p>
            <p className="text-sm text-muted-foreground">
              ✅ 30-day money-back guarantee
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-finance-navy">
              Quick Links
            </h4>
            <div className="space-y-2 flex flex-col items-center md:items-start">
              <Link
                href="/#how-it-works"
                className="text-finance-green hover:text-finance-green-dark transition-colors duration-200 font-medium"
              >
                How it works
              </Link>
              <Link
                href="/#pricing"
                className="text-finance-green hover:text-finance-green-dark transition-colors duration-200 font-medium"
              >
                Pricing
              </Link>
              <Link
                href="/free-budget-template"
                className="text-finance-green hover:text-finance-green-dark transition-colors duration-200 font-medium"
              >
                Free Budget Template
              </Link>
              <Link
                href="/stories"
                className="text-finance-green hover:text-finance-green-dark transition-colors duration-200 font-medium"
              >
                Stories
              </Link>
            </div>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold mb-4 text-finance-navy">Tools</h4>
            <div className="space-y-2 flex flex-col items-center md:items-start">
              <Link
                href="/tools/mortgage-deposit-vs-invest-calculator"
                className="text-finance-green hover:text-finance-green-dark transition-colors duration-200 font-medium"
              >
                Mortgage Deposit vs Investment
              </Link>
            </div>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="font-semibold mb-4 text-finance-navy">Connect</h4>
            <div className="space-y-2">
              <div className="flex justify-center md:justify-start space-x-4">
                <a
                  href="mailto:hello@personifi.xyz"
                  className="hover:opacity-80 transition-opacity duration-200 text-finance-green"
                  aria-label="Email"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@Personifi_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity duration-200"
                  aria-label="YouTube"
                  style={{ color: "#FF0000" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/personifi_app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity duration-200"
                  aria-label="Instagram"
                  style={{ color: "#E4405F" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>

                <a
                  href="https://www.tiktok.com/@personifi_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity duration-200"
                  aria-label="TikTok"
                  style={{ color: "#000000" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} personifi. Made with ❤️ for
            couples who want financial clarity.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
