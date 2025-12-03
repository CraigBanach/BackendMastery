import { getBlogPost, getBlogPosts } from "@/lib/blog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { TrackedLinkButton } from "@/components/ui/tracked-link-button";
import Link from "next/link";
import { Metadata } from "next";

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const params = await props.params;
  const post = getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Personifi Stories`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      locale: "en_GB",
      authors: ["Personifi Team"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage(props: { params: Params }) {
  const params = await props.params;
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-finance-green-light/20 to-white  -mt-16 pt-20 pb-20 px-4">
        <article className="container max-w-3xl mx-auto py-8 px-4 space-y-8">
          <div className="space-y-4">
            <Link
              href="/stories"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              ← Back to Blog
            </Link>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-finance-navy">
              {post.title}
            </h1>
            {post.date && (
              <p className="text-muted-foreground">
                Published on {format(new Date(post.date), "MMMM d, yyyy")}
              </p>
            )}
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => (
                  <h1
                    className="text-3xl font-bold mt-8 mb-4 text-finance-navy"
                    {...props}
                  />
                ),
                h2: ({ ...props }) => (
                  <h2
                    className="text-2xl font-bold mt-8 mb-4 text-finance-navy"
                    {...props}
                  />
                ),
                h3: ({ ...props }) => (
                  <h3
                    className="text-xl font-bold mt-6 mb-3 text-finance-navy"
                    {...props}
                  />
                ),
                p: ({ ...props }) => (
                  <p
                    className="leading-7 [&:not(:first-child)]:mt-6"
                    {...props}
                  />
                ),
                ul: ({ ...props }) => (
                  <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol
                    className="my-6 ml-6 list-decimal [&>li]:mt-2"
                    {...props}
                  />
                ),
                li: ({ ...props }) => <li className="" {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="mt-6 border-l-2 pl-6 italic"
                    {...props}
                  />
                ),
                table: ({ ...props }) => (
                  <div className="my-6 w-full overflow-y-auto">
                    <table className="w-full" {...props} />
                  </div>
                ),
                thead: ({ ...props }) => (
                  <thead className="bg-muted" {...props} />
                ),
                tr: ({ ...props }) => (
                  <tr
                    className="m-0 border-t p-0 even:bg-muted/50"
                    {...props}
                  />
                ),
                th: ({ ...props }) => (
                  <th
                    className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right"
                    {...props}
                  />
                ),
                td: ({ ...props }) => (
                  <td
                    className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right"
                    {...props}
                  />
                ),
                a: ({ ...props }) => (
                  <a
                    className="font-medium text-finance-green underline underline-offset-4 hover:text-finance-green-dark"
                    {...props}
                  />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          <div className="mt-12 p-6 rounded-lg flex flex-col items-center text-center space-y-4">
            <h3 className="text-xl font-bold text-finance-navy">
              Stop Arguing About Money
            </h3>
            <p className="text-muted-foreground max-w-md">
              Join thousands of couples using Personifi to simplify their
              finances and focus on their relationship.
            </p>
            <TrackedLinkButton
              href="/"
              eventName="click_signup"
              size="lg"
              className="bg-finance-green hover:bg-finance-green-dark text-white"
            >
              Try Personifi Free
            </TrackedLinkButton>
          </div>
        </article>
      </div>
    </div>
  );
}
