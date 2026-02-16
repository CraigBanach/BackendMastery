"use server";

import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
});

export type SubscribeState = {
  success: boolean;
  message?: string;
  errors?: {
    email?: string[];
    firstName?: string[];
  };
};

export async function subscribeToKit(
  prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const validatedFields = subscribeSchema.safeParse({
    email: formData.get("email"),
    firstName: formData.get("firstName") || undefined,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please define a valid email address.",
    };
  }

  const { email, firstName } = validatedFields.data;
  const API_KEY = process.env.KIT_API_KEY;
  const FORM_ID = process.env.KIT_FORM_ID;

  if (!API_KEY || !FORM_ID) {
    console.error("Missing KIT_API_KEY or KIT_FORM_ID");
    return { success: false, message: "Configuration error. Please try again." };
  }

  try {
    // 1. Create/Upsert Subscriber
    const createSubscriberResponse = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": API_KEY,
      },
      body: JSON.stringify({
        email_address: email,
        first_name: firstName,
      }),
    });

    const subscriberData = await createSubscriberResponse.json();

    if (!createSubscriberResponse.ok) {
      console.error("Kit API Error (Create Subscriber):", subscriberData);
      return { success: false, message: "Could not sign up. Please try again." };
    }

    const subscriberId = subscriberData.subscriber.id;

    // 2. Add Subscriber to Form
    const addToFormResponse = await fetch(
      `https://api.kit.com/v4/forms/${FORM_ID}/subscribers/${subscriberId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": API_KEY,
        },
        body: JSON.stringify({}),
      }
    );

    if (!addToFormResponse.ok) {
      const formData = await addToFormResponse.json();
      console.error("Kit API Error (Add to Form):", formData);
      // Even if this fails, the subscriber was created, so we might want to consider it a partial success
      // But for now, let's return error to be safe
      return { success: false, message: "Could not add to list. Please try again." };
    }

    return { success: true };
  } catch (error) {
    console.error("Submission error:", error);
    return { success: false, message: "Failed to connect. Please try again." };
  }
}
