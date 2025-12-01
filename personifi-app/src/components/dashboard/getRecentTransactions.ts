"use server";

import { getAccessToken } from "@/lib/AuthProvider";

export const getRecentTransactions = async () => {
  try {
    const token = await getAccessToken();
    
    console.log('Fetching from:', process.env.PERSONIFI_BACKEND_URL);
    console.log('Token:', token ? 'Present' : 'Missing');

    const res = await fetch(
      `${process.env.PERSONIFI_BACKEND_URL}/transaction`,
      {
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json",
        },
        method: "GET",
      }
    );

    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));
    
    if (res?.ok) {
      const transactionResponse = await res.json();
      return transactionResponse.items;
    } else {
      const responseText = await res.text();
      console.log('Response text:', responseText);
      console.error(
        "Failed to fetch transactions: ",
        res.status,
        res.statusText,
        "Body: ",
        responseText
      );
      throw new Error(
        `HTTP Response Code: ${res?.status} \nHTTP Response Status: ${res.statusText}\nBody: ${responseText}`
      );
    }
  } catch (e) {
    throw e;
  }
};
