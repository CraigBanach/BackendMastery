import { getBlogPosts } from "@/lib/blog";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://personifi.xyz"; // Replace with your actual domain if different

  // Static routes
  const routes = [
    "",
    "/stories",
    "/free-budget-template",
    "/free-month-budget-review",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic blog posts
  const posts = getBlogPosts().map((post) => ({
    url: `${baseUrl}/stories/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...routes, ...posts];
}
