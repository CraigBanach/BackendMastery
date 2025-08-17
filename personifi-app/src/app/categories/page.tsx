import { getCategories } from "@/lib/api/categoryApi";
import { CategoriesPageClient } from "@/components/categories/categoriesPageClient";
import { PageHeader } from "@/components/ui/pageHeader";
import { RequireAccount } from "@/components/ui/requireAccount";

export default async function CategoriesPage() {
  let categories;
  
  try {
    categories = await getCategories();
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    categories = [];
  }

  return (
    <RequireAccount>
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Categories"
          subTitle="Manage your income and expense categories"
        />
        <CategoriesPageClient initialCategories={categories} />
      </div>
    </RequireAccount>
  );
}