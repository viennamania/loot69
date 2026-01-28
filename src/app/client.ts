import { createThirdwebClient } from "thirdweb";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID

export const clientId = process.env.NEXT_PUBLIC_TEMPLATE_CLIENT_ID;

if (!clientId) {
  throw new Error("No client ID provided - NEXT_PUBLIC_TEMPLATE_CLIENT_ID environment variable is not set");
}

export const client = createThirdwebClient({
  clientId: clientId,
});



