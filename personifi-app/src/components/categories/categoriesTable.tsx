"use client";

import { CategoryDto } from "@/types/budget";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import { CategoryIcon } from "@/components/ui/categoryIcon";

interface CategoriesTableProps {
  categories: CategoryDto[];
  onEdit: (category: CategoryDto) => void;
  onDelete: (category: CategoryDto) => void;
}

export function CategoriesTable({ categories, onEdit, onDelete }: CategoriesTableProps) {
  if (categories.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No categories found. Create your first category to get started.</p>
      </Card>
    );
  }

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className="block sm:hidden space-y-3">
        {categories.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CategoryIcon
                  icon={category.icon || "📁"}
                  color={category.color}
                  size="lg"
                />
                <div>
                  <div className="font-semibold text-base">{category.name}</div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    category.type === "Expense" 
                      ? "bg-red-100 text-red-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {category.type}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(category)}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                  <span className="sr-only">Edit category</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(category)}
                  className="h-8 w-8 p-0 text-destructive hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <span className="sr-only">Delete category</span>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden sm:block rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Icon
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Type
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-4 align-middle">
                    <CategoryIcon
                      icon={category.icon || "📁"}
                      color={category.color}
                      size="lg"
                    />
                  </td>
                  <td className="p-4 align-middle font-medium">
                    {category.name}
                  </td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      category.type === "Expense" 
                        ? "bg-red-100 text-red-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {category.type}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit category</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(category)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete category</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}