"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalManager } from "@/lib/providers/modal-provider";
import { CategoryDto, CategoryType } from "@/types/budget";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/api/categoryApi";
import { setBudgetsForMonth } from "@/lib/api/budgetApi";
import { CategoriesTable } from "./categoriesTable";
import { CategoryModal } from "./categoryModal";
import { DeleteCategoryModal } from "./deleteCategoryModal";


interface CategoriesPageClientProps {
  initialCategories: CategoryDto[];
}

export function CategoriesPageClient({ initialCategories }: CategoriesPageClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryDto | null>(null);
  const { isModalOpen } = useModalManager();


  const expenseCategories = categories.filter(category => category.type === CategoryType.Expense);
  const incomeCategories = categories.filter(category => category.type === CategoryType.Income);

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
    color?: string;
    budgetAmount?: number;
  }) => {
    try {
      const newCategory = await createCategory({
        name: categoryData.name,
        type: categoryData.type,
        icon: categoryData.icon,
        color: categoryData.color,
      });
      
      // If budgetAmount provided, create budget for current month
      if (categoryData.budgetAmount && categoryData.budgetAmount > 0) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // JavaScript months are 0-based
        
        await setBudgetsForMonth(year, month, [
          {
            categoryId: newCategory.id,
            amount: categoryData.budgetAmount,
          }
        ]);
      }
      
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
    color?: string;
    budgetAmount?: number;
  }) => {
    if (!editingCategory) return;

    try {
      await updateCategory(editingCategory.id, {
        name: categoryData.name,
        type: categoryData.type,
        icon: categoryData.icon,
        color: categoryData.color,
      });

      // If budgetAmount provided, update budget for current month
      if (typeof categoryData.budgetAmount === 'number' && categoryData.budgetAmount >= 0) {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // JavaScript months are 0-based
        
        await setBudgetsForMonth(year, month, [
          {
            categoryId: editingCategory.id,
            amount: categoryData.budgetAmount,
          }
        ]);
      }
      
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
    <div className="space-y-8">
      {/* Add Category Button */}
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)} disabled={isModalOpen}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>


      {/* Expense Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Expense Categories</h2>
          <span className="text-sm text-gray-500">
            {expenseCategories.length} {expenseCategories.length === 1 ? 'category' : 'categories'}
          </span>
        </div>
        
        {expenseCategories.length > 0 ? (
          <CategoriesTable
            categories={expenseCategories}
            onEdit={setEditingCategory}
            onDelete={setDeletingCategory}
          />
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No expense categories created yet.</p>
            <p className="text-sm text-gray-400 mt-1">Create categories to track your spending.</p>
          </div>
        )}
      </div>

      {/* Income Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Income Categories</h2>
          <span className="text-sm text-gray-500">
            {incomeCategories.length} {incomeCategories.length === 1 ? 'category' : 'categories'}
          </span>
        </div>
        
        {incomeCategories.length > 0 ? (
          <CategoriesTable
            categories={incomeCategories}
            onEdit={setEditingCategory}
            onDelete={setDeletingCategory}
          />
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No income categories created yet.</p>
            <p className="text-sm text-gray-400 mt-1">Create categories to track your income sources.</p>
          </div>
        )}
      </div>

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