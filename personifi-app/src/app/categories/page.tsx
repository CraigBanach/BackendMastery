import { getCategories } from "@/lib/api/categoryApi";
import { CategoriesPageClient } from "@/components/categories/categoriesPageClient";
import { CategoriesPageWithFab } from "@/components/categories/categoriesPageWithFab";
import { PageHeader } from "@/components/ui/pageHeader";
import { RequireAccount } from "@/components/ui/requireAccount";
import { Category } from "@/types/transaction";

export default async function CategoriesPage() {
  let categories: Category[];
  
  try {
    categories = await getCategories();
  } catch (error: unknown) {
    console.error('Error fetching categories:', error);
    categories = [];
  }

  return (
    <RequireAccount>
      <CategoriesPageWithFab categories={categories}>
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Categories"
            subTitle="Manage your income and expense categories"
          />
          <CategoriesPageClient initialCategories={categories} />
        </div>
      </CategoriesPageWithFab>
    </RequireAccount>
  );
}