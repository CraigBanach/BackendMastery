import { getBlogPost, getBlogPosts } from "@/lib/blog";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { TrackedLinkButton } from "@/components/ui/tracked-link-button";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found | Personifi",
    };
  }

  return {
    title: `${post.title} | Personifi`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/stories/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-finance-green-light/20 to-white -mt-16 pt-24 pb-12">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-8">
          <Button asChild variant="ghost" className="pl-0 hover:bg-transparent hover:text-finance-green">
            <Link href="/stories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Stories
            </Link>
          </Button>
        </div>

        <article className="prose prose-lg prose-slate mx-auto bg-white/50 p-8 rounded-2xl shadow-sm backdrop-blur-sm">
          <header className="mb-8 not-prose">
            <time className="text-sm text-muted-foreground mb-2 block">
              {format(new Date(post.date), "MMMM d, yyyy")}
            </time>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              {post.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {post.description}
            </p>
          </header>

          <div className="mt-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="bg-white rounded-2xl p-8 text-center shadow-md">
            <h3 className="text-2xl font-bold mb-4">
              Ready to try Personifi?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Create a shared view of your money and start planning together.
            </p>
              <TrackedLinkButton
                href="/auth/login?screen_hint=signup&signup_source=default"
              eventName="signup_started"
              size="lg"
              className="bg-finance-green hover:bg-finance-green-dark"
            >
              Try it with your partner
            </TrackedLinkButton>

            <p className="text-sm text-muted-foreground mt-4">
              Or explore our{" "}
              <Link
                href="/free-budget-template"
                className="text-finance-green font-medium hover:text-finance-green-dark"
              >
                free budget template
              </Link>{" "}
              and{" "}
              <Link
                href="/tools"
                className="text-finance-green font-medium hover:text-finance-green-dark"
              >
                planning tools
              </Link>
              .
            </p>

          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            author: {
              "@type": "Organization",
              name: "Personifi",
              url: "https://personifi.xyz",
            },
            publisher: {
              "@type": "Organization",
              name: "Personifi",
              url: "https://personifi.xyz",
              logo: {
                "@type": "ImageObject",
                url: "https://personifi.xyz/personifi-opengraph-image.png",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://personifi.xyz/stories/${slug}`,
            },
          }),
        }}
      />
    </div>
  );
}
