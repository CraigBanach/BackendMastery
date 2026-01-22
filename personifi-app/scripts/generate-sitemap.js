const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const baseUrl = "https://personifi.xyz";
const today = new Date().toISOString().slice(0, 10);

const contentDirectory = path.join(process.cwd(), "src", "content", "blog");

const normalizeDate = (value) => {
  if (!value) {
    return today;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    return value.slice(0, 10);
  }

  return today;
};

const getBlogPosts = () => {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  return fs
    .readdirSync(contentDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);

      return {
        slug,
        date: normalizeDate(matterResult.data.date),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
};

const routes = [
  "",
  "/stories",
  "/free-budget-template",
  "/free-month-budget-review",
].map((route) => ({
  url: `${baseUrl}${route}`,
  lastModified: today,
  changeFrequency: "weekly",
  priority: route === "" ? "1.0" : "0.8",
}));

const posts = getBlogPosts().map((post) => ({
  url: `${baseUrl}/stories/${post.slug}`,
  lastModified: post.date,
  changeFrequency: "monthly",
  priority: "0.7",
}));

const urls = [...routes, ...posts];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const publicDir = path.join(process.cwd(), "public");
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml, "utf8");

console.log("Generated sitemap.xml");
