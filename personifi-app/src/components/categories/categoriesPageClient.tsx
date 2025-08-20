"use client";

import { useState } from "react";
import { CategoryDto, CategoryType } from "@/types/budget";
import { CategoriesTable } from "./categoriesTable";
import { CategoryModal } from "./categoryModal";
import { DeleteCategoryModal } from "./deleteCategoryModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from "@/lib/api/categoryApi";

interface CategoriesPageClientProps {
  initialCategories: CategoryDto[];
}

export function CategoriesPageClient({ initialCategories }: CategoriesPageClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryDto | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | CategoryType>("all");

  const filteredCategories = categories.filter(category => 
    typeFilter === "all" || category.type === typeFilter
  );

  const refreshCategories = async () => {
    try {
      const updated = await getCategories();
      setCategories(updated);
    } catch (error) {
      console.error("Failed to refresh categories:", error);
    }
  };

  const handleCreateCategory = async (categoryData: {
    name: string;
    type: CategoryType;
    icon?: string;
    budgetAmount?: number;
  }) => {
    try {
      await createCategory({
        name: categoryData.name,
        type: categoryData.type,
        icon: categoryData.icon,
      });
      
      // TODO: If budgetAmount provided, create budget for current month
      // This would require integrating with budget API
      
      await refreshCategories();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  };

  const handleUpdateCategory = async (categoryData: {
    name: string;
    type: CategoryType;
    icon?: string;
    budgetAmount?: number;
  }) => {
    if (!editingCategory) return;

    try {
      await updateCategory(editingCategory.id, {
        name: categoryData.name,
        type: categoryData.type,
        icon: categoryData.icon,
      });

      // TODO: If budgetAmount provided, update budget for current month
      
      await refreshCategories();
      setEditingCategory(null);
    } catch (error) {
      console.error("Failed to update category:", error);
      throw error;
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.id);
      await refreshCategories();
      setDeletingCategory(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Mobile: Stacked Layout */}
      <div className="block sm:hidden space-y-4">
        {/* Filter Buttons - Stacked */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              variant={typeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter("all")}
              className="flex-1"
            >
              All Categories
            </Button>
            <Button
              variant={typeFilter === CategoryType.Expense ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(CategoryType.Expense)}
              className="flex-1"
            >
              Expenses
            </Button>
          </div>
          <Button
            variant={typeFilter === CategoryType.Income ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter(CategoryType.Income)}
            className="w-full"
          >
            Income
          </Button>
        </div>
        
        {/* Add Category Button - Full Width */}
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Desktop: Original Horizontal Layout */}
      <div className="hidden sm:flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={typeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("all")}
          >
            All Categories
          </Button>
          <Button
            variant={typeFilter === CategoryType.Expense ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter(CategoryType.Expense)}
          >
            Expenses
          </Button>
          <Button
            variant={typeFilter === CategoryType.Income ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter(CategoryType.Income)}
          >
            Income
          </Button>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <CategoriesTable
        categories={filteredCategories}
        onEdit={setEditingCategory}
        onDelete={setDeletingCategory}
      />

      {/* Modals */}
      <CategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateCategory}
        title="Create Category"
      />

      <CategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onSave={handleUpdateCategory}
        category={editingCategory}
        title="Edit Category"
      />

      <DeleteCategoryModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        category={deletingCategory}
      />
    </div>
  );
}