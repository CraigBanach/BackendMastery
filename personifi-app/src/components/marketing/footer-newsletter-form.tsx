"use client";

import { useActionState, useEffect, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { trackEvent as track } from "@/lib/analytics";
import { subscribeToKit, SubscribeState } from "@/app/(marketing)/free-budget-template/actions";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  // We'll skip first name for the footer to keep it minimal
});

export function FooterNewsletterForm() {
  const [state, formAction, isPending] = useActionState<SubscribeState, FormData>(subscribeToKit, {
    success: false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (state.success) {
      track("newsletter_signup_success", { location: "footer" });
      form.reset();
    }
  }, [state.success, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    track("newsletter_signup_attempt", { location: "footer" });
    const formData = new FormData();
    formData.append("email", values.email);
    // No first name for footer form
    startTransition(() => {
      formAction(formData);
    });
  }



  if (state.success) {
    return (
      <div className="bg-finance-green/10 border border-finance-green/20 rounded-md p-3 flex items-center gap-2 text-finance-green-dark text-sm animate-in fade-in slide-in-from-bottom-2">
        <CheckCircle2 className="h-4 w-4" />
        <span className="font-medium">Thanks for subscribing!</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto md:mx-0">
      <h4 className="font-semibold mb-2 text-finance-navy text-center md:text-left">Financial Insights</h4>
      <p className="text-sm text-muted-foreground mb-3 text-center md:text-left">
        Join the newsletter for weekly clarity and strategy.
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-2"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Enter your email"
                      className="pl-9 bg-white"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            disabled={isPending} 
            size="sm"
            className="w-full bg-finance-navy hover:bg-finance-navy/90 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              "Subscribe"
            )}
          </Button>
           {state.message && !state.success && (
            <p className="text-xs text-destructive mt-1">{state.message}</p>
          )}
        </form>
      </Form>
    </div>
  );
}
