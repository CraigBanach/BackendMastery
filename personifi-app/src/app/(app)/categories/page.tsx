import { Suspense } from "react";
import { getCategories } from "@/lib/api/categoryApi";
import { CategoriesPageClient } from "@/components/categories/categoriesPageClient";
import { CategoriesPageWithFab } from "@/components/categories/categoriesPageWithFab";
import { PageHeader } from "@/components/ui/pageHeader";
import { RequireAccount } from "@/components/ui/requireAccount";
import { Category } from "@/types/transaction";


export const dynamic = 'force-dynamic';

async function CategoriesContent() {
  let categories: Category[];

  try {
    categories = await getCategories();
  } catch (error: unknown) {
    console.error("Error fetching categories:", error);
    categories = [];
  }

  return (
    <CategoriesPageWithFab categories={categories}>
      <CategoriesPageClient initialCategories={categories} />
    </CategoriesPageWithFab>
  );
}

const CategoriesLoading = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-16 rounded-lg bg-muted" />
    <div className="h-64 rounded-lg bg-muted" />
  </div>
);

export default async function CategoriesPage() {
  return (
    <RequireAccount>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <PageHeader
          title="Categories"
          subTitle="Manage your income and expense categories"
        />
        <Suspense fallback={<CategoriesLoading />}>
          <CategoriesContent />
        </Suspense>
      </div>
    </RequireAccount>
  );
}
