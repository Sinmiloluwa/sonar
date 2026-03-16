import admin from "firebase-admin";
import { createRequire } from "module";

let initialized = false;

export const initFirebase = (): void => {
  if (initialized) {
    console.log("Firebase Admin already initialized");
    return;
  }

  let credential: admin.credential.Credential | undefined;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    let serviceAccount: admin.ServiceAccount;
    console.log("Parsing FIREBASE_SERVICE_ACCOUNT_JSON...");
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch (err) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", (err as Error).message);
      console.error("First 50 chars of value:", process.env.FIREBASE_SERVICE_ACCOUNT_JSON.slice(0, 50));
      return;
    }
    credential = admin.credential.cert(serviceAccount);
    console.log("Firebase Admin credentials parsed");
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const require = createRequire(import.meta.url);
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH) as admin.ServiceAccount;
    credential = admin.credential.cert(serviceAccount);
  } else {
    console.warn("Firebase credentials not configured — push notifications disabled");
    return;
  }

  try {
    admin.initializeApp({ credential });
    initialized = true;
  } catch (err) {
    console.error("Failed to initialize Firebase Admin:", (err as Error).message);
  }
};

interface PushResult {
  staleToken?: boolean;
}

export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data: Record<string, unknown> = {}
): Promise<string | PushResult | null> => {
  if (!initialized) {
    console.warn("Firebase Admin not initialized — cannot send push notification");
    return null;
  }

  const message: admin.messaging.Message = {
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
    token: fcmToken,
    android: { priority: "high" },
    apns: {
      headers: { "apns-push-type": "alert", "apns-priority": "10" },
      payload: { aps: { sound: "default", contentAvailable: true, interruptionLevel: "time-sensitive" } },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Push notification sent:", response);
    return response;
  } catch (err: unknown) {
    console.error("Error sending push notification:", err);
    const firebaseErr = err as { code?: string };
    if (
      firebaseErr.code === "messaging/registration-token-not-registered" ||
      firebaseErr.code === "messaging/invalid-registration-token" ||
      firebaseErr.code === "messaging/invalid-argument"
    ) {
      return { staleToken: true };
    }
    throw err;
  }
};
