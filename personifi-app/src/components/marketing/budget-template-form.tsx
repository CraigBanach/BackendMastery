"use client";

import { useActionState, useEffect, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Download, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLevelMessage,
  FormMessage,
} from "@/components/ui/form";
import { trackEvent } from "@/lib/analytics";
import { subscribeToKit } from "@/app/(marketing)/free-budget-template/actions";

// Schema for validation
const formSchema = z.object({
  firstName: z.string().optional(),
  email: z.string().email("Please enter a valid email address."),
});

type FormValues = z.infer<typeof formSchema>;

// ... imports remain the same

export function BudgetTemplateForm() {
  const [state, formAction] = useActionState(subscribeToKit, { success: false });

  // Hardcoded template URL for fallback/success state
  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1txy_9_NyHuKZpSONJ5QyhHvm8if9Af5G8Zq7bn9eX30/edit#gid=0";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      email: "",
    },
  });

  // Watch for server action success
  useEffect(() => {
    if (state.success) {
      trackEvent("template_form_success");
    } else if (state.message) {
       // Optional: handle global error message display
       console.error(state.message);
    }
  }, [state]);

  async function onSubmit(data: FormValues) {
    trackEvent("template_form_submit_attempt");
    const formData = new FormData();
    formData.append("email", data.email);
    if (data.firstName) formData.append("firstName", data.firstName);
    
    // Trigger server action
    startTransition(() => {
        formAction(formData);
    });
  }
// ... rest of the component


  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Download className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-finance-navy mb-2">You&apos;re all set!</h3>
        <p className="text-muted-foreground mb-6">
          We&apos;ve sent the template to your email. You can also open it directly below.
        </p>
        <Button 
          asChild 
          size="lg" 
          className="w-full sm:w-auto bg-finance-green hover:bg-finance-green-dark text-base px-8"
        >
          <a href={GOOGLE_SHEET_URL} target="_blank" rel="noopener noreferrer">
            Open Google Sheet
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-finance-navy mb-2">
          Get the free template
        </h3>
        <p className="text-muted-foreground text-sm">
          Join 8,000+ others taking control of their money.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="First Name (optional)" 
                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="Enter your email address" 
                    type="email"
                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            size="lg"
            className="w-full bg-finance-green hover:bg-finance-green-dark text-base h-11"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Get Free Template"
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground pt-2">
            We respect your privacy. Unsubscribe at any time.
          </p>
          <FormLevelMessage />
        </form>
      </Form>
    </div>
  );
}
