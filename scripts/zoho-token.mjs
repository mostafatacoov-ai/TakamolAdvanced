#!/usr/bin/env node
/* Turns a Zoho API console "Self Client" code into the refresh token the
   site needs for sending notification emails through the Zoho Mail API.

   Usage:  npm run zoho:token -- <client_id> <client_secret> <code> [accounts_url]

   The code expires a few minutes after it is generated, so run this right
   away. The accounts URL defaults to https://accounts.zoho.com; use the
   matching domain for other data centres (e.g. https://accounts.zoho.eu). */

const [clientId, clientSecret, code, accountsUrl = "https://accounts.zoho.com"] = process.argv.slice(2);

if (!clientId || !clientSecret || !code) {
  console.error("Usage: npm run zoho:token -- <client_id> <client_secret> <code> [accounts_url]");
  process.exit(1);
}

const response = await fetch(`${accountsUrl.replace(/\/$/, "")}/oauth/v2/token`, {
  method: "POST",
  body: new URLSearchParams({ grant_type: "authorization_code", client_id: clientId, client_secret: clientSecret, code }),
});
const data = await response.json();

if (!data.refresh_token) {
  console.error("Zoho did not return a refresh token:", JSON.stringify(data));
  console.error("Generate a fresh code in the API console (Self Client › Generate Code) and try again.");
  process.exit(1);
}

console.log("\nAdd these environment variables to the server, then restart the app:\n");
console.log(`ZOHO_CLIENT_ID=${clientId}`);
console.log(`ZOHO_CLIENT_SECRET=${clientSecret}`);
console.log(`ZOHO_REFRESH_TOKEN=${data.refresh_token}`);
if (!accountsUrl.includes("zoho.com")) {
  console.log(`ZOHO_ACCOUNTS_URL=${accountsUrl}`);
  console.log(`ZOHO_MAIL_URL=${accountsUrl.replace("accounts.", "mail.")}`);
}
console.log("");
