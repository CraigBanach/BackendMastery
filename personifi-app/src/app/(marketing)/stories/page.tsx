import { getBlogPosts } from "@/lib/blog";
import { PageHeader } from "@/components/ui/pageHeader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personifi Blog | Stories & Financial Tips for UK Couples  Blog",
  description: "Real money stories, budgeting tips, and financial advice for UK couples. Learn how to manage money together without the arguments.",
  keywords: "couples finance blog, UK money tips, relationship finance, wedding budget breakdown, shared finances, money arguments",
  alternates: {
    canonical: "/stories",
  },
  openGraph: {
    title: "Personifi Stories: Real Money Talk for Couples",
    description: "Real stories and practical tips for managing money as a team.",
    type: "website",
    locale: "en_GB",
  }
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-finance-green-light/20 to-white -mt-16 pt-40 pb-20 px-4 flex-grow-1">
      <div className="container max-w-5xl mx-auto space-y-8">
        <PageHeader
          title="Personifi Stories"
          subTitle="Real stories, financial tips, and updates from the team."
        />

        <p className="text-center text-sm text-muted-foreground mb-6 px-2">
          Looking for something hands-on? Try our{" "}
          <Link
            href="/free-budget-template"
            className="text-finance-green font-medium hover:text-finance-green-dark"
          >
            free budget template
          </Link>{" "}
          or explore our{" "}
          <Link
            href="/tools"
            className="text-finance-green font-medium hover:text-finance-green-dark"
          >
            planning tools
          </Link>
          .
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/stories/${post.slug}`}
              className="block h-full"
            >
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription>
                    {post.date
                      ? format(new Date(post.date), "MMMM d, yyyy")
                      : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-4">
                    {post.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
