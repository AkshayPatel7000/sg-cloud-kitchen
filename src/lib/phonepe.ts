import crypto from "crypto";

export const PHONEPE_CONFIG = {
  MERCHANT_ID: process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID || "",
  SALT_KEY: process.env.PHONEPE_SALT_KEY || "",
  SALT_INDEX: process.env.PHONEPE_SALT_INDEX || "1",
  ENV: process.env.PHONEPE_ENV || "sandbox", // sandbox or production
};

const BASE_URLS = {
  sandbox: "https://api-preprod.phonepe.com/apis/hermes",
  production: "https://api.phonepe.com/apis/hermes",
};

export function getPhonePeUrl(endpoint: string) {
  const baseUrl =
    PHONEPE_CONFIG.ENV === "production"
      ? BASE_URLS.production
      : BASE_URLS.sandbox;
  return `${baseUrl}${endpoint}`;
}

export function generateChecksum(payload: any, endpoint: string) {
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const string = base64Payload + endpoint + PHONEPE_CONFIG.SALT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  return {
    checksum: `${sha256}###${PHONEPE_CONFIG.SALT_INDEX}`,
    base64Payload,
  };
}

export async function initiatePayment(params: {
  transactionId: string;
  amount: number;
  userId: string;
  phone?: string;
  redirectUrl: string;
  callbackUrl: string;
}) {
  const endpoint = "/pg/v1/pay";
  const payload = {
    merchantId: PHONEPE_CONFIG.MERCHANT_ID,
    merchantTransactionId: params.transactionId,
    merchantUserId: params.userId,
    amount: Math.round(params.amount * 100), // amount in paisa
    redirectUrl: params.redirectUrl,
    redirectMode: "POST",
    callbackUrl: params.callbackUrl,
    mobileNumber: params.phone,
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const { checksum, base64Payload } = generateChecksum(payload, endpoint);

  const response = await fetch(getPhonePeUrl(endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    body: JSON.stringify({ request: base64Payload }),
  });

  return response.json();
}

export async function checkPaymentStatus(transactionId: string) {
  const endpoint = `/pg/v1/status/${PHONEPE_CONFIG.MERCHANT_ID}/${transactionId}`;
  const string = endpoint + PHONEPE_CONFIG.SALT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = `${sha256}###${PHONEPE_CONFIG.SALT_INDEX}`;

  const response = await fetch(getPhonePeUrl(endpoint), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": PHONEPE_CONFIG.MERCHANT_ID,
    },
  });

  return response.json();
}
