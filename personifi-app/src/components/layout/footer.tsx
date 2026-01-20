import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white border-t py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
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
            <h4 className="font-semibold mb-4 text-finance-navy">Quick Links</h4>
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

          {/* Contact & Social */}
          <div>
            <h4 className="font-semibold mb-4 text-finance-navy">Connect</h4>
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Follow us for updates:
              </p>
              <div className="flex justify-center md:justify-start space-x-4">
                <div className="text-muted-foreground text-sm">
                  Social media links coming soon
                </div>
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
