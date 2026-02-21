import admin from "firebase-admin";
import { createRequire } from "module";

let initialized = false;

export const initFirebase = () => {
  if (initialized) return;

  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const require = createRequire(import.meta.url);
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    credential = admin.credential.cert(serviceAccount);
  } else {
    console.warn("Firebase credentials not configured — push notifications disabled");
    return;
  }

  admin.initializeApp({ credential });
  initialized = true;
  console.log("Firebase Admin initialized");
};

export const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!initialized) return null;

  const message = {
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v)])
    ),
    token: fcmToken,
    android: { priority: "high" },
    apns: { payload: { aps: { contentAvailable: true } } },
  };

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (err) {
    if (
      err.code === "messaging/registration-token-not-registered" ||
      err.code === "messaging/invalid-registration-token"
    ) {
      return { staleToken: true };
    }
    throw err;
  }
};
