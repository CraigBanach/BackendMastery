"use server";

import { auth0 } from "@/lib/auth0";

export const getRecentTransactions = async () => {
  try {
    const token = await auth0.getAccessToken();

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

    if (res?.ok) {
      const transactionResponse = await res.json();
      console.log("CbTest: ", transactionResponse);
      return transactionResponse.items;
    } else {
      // TODO: Update
      console.error(
        "Failed to create a new Transaction: ",
        res,
        "Body: ",
        await res.text()
      );
      throw new Error(
        `HTTP Response Code: ${res?.status} \nHTTP Response Status: ${res.statusText}`
      );
    }
  } catch (e) {
    throw e;
  }
};
