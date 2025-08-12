import { getCategories } from "@/lib/api/categoryApi";
import { CategoriesPageClient } from "@/components/categories/categoriesPageClient";
import { PageHeader } from "@/components/ui/pageHeader";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-6">
      <PageHeader
        title="Categories"
        subTitle="Manage your income and expense categories"
      />
      <CategoriesPageClient initialCategories={categories} />
    </div>
  );
}