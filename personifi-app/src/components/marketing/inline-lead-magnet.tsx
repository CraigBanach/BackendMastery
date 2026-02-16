"use client";

import { BudgetTemplateForm } from "@/components/marketing/budget-template-form";
import { Badge } from "@/components/ui/badge";

export function InlineLeadMagnet() {
  return (
    <div className="my-16 bg-gradient-to-br from-finance-green-light/20 to-white border border-finance-green-light/30 rounded-2xl p-8 lg:p-10 shadow-sm relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-finance-green-light/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-100/30 rounded-full blur-2xl opacity-50" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
                 <Badge
                  variant="secondary"
                  className="mb-4 bg-white text-finance-green-dark hover:bg-white inline-block shadow-sm"
                >
                  🎁 Free Download
                </Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-finance-navy mb-4">
                    Stop fighting about money
                </h3>
                <p className="text-muted-foreground text-lg mb-6">
                    Get the exact Google Sheets template we used to pay off debt and build wealth together.
                </p>
                <ul className="text-left text-sm text-finance-navy space-y-2 inline-block mx-auto lg:mx-0">
                    <li className="flex items-center">
                        <span className="bg-finance-green text-white rounded-full p-0.5 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        Track combined income & expenses
                    </li>
                    <li className="flex items-center">
                         <span className="bg-finance-green text-white rounded-full p-0.5 mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </span>
                        Plan your dream goals
                    </li>
                </ul>
            </div>
            
            <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-md p-1">
                <div className="scale-90 origin-center sm:scale-100">
                   {/* We wrap the form to possibly style it differently if needed, 
                       but for now direct reuse is fine. we might want to pass a prop 'compact' later */}
                   <BudgetTemplateForm />
                </div>
            </div>
        </div>
    </div>
  );
}
