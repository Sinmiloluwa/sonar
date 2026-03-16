import Notification from "../models/notification.js";
import User from "../models/user.js";
import Follow from "../models/follow.js";
import { sendPushNotification } from "./firebase.js";
import { sendNotificationEmail } from "./notificationEmail.js";
import { addNotificationJob } from "./bullmq.js";
import { Types } from "mongoose";
import { NotificationType } from "../models/notification.js";
import { ReactionType } from "../models/reaction.js";

type MongoId = Types.ObjectId | string;

interface NotificationPayload {
  title: string;
  body: string;
  emailSubject: string;
  emailBody: string;
}

const buildPayload = (type: NotificationType, { actorName, reactionType }: { actorName: string; reactionType?: string }): NotificationPayload => {
  switch (type) {
    case "reaction":
      return {
        title: "New reaction",
        body: `${actorName} reacted ${reactionType} to your post`,
        emailSubject: `${actorName} reacted to your voice post`,
        emailBody: `${actorName} left a ${reactionType} reaction on your recent voice post. Open Sonar to listen.`,
      };
    case "new_follower":
      return {
        title: "New follower",
        body: `${actorName} started following you`,
        emailSubject: `${actorName} is now following you on Sonar`,
        emailBody: `${actorName} started following you. Check out their profile on Sonar.`,
      };
    case "upload_complete":
      return {
        title: "Upload complete",
        body: "Your voice post is live",
        emailSubject: "Your voice post is live on Sonar",
        emailBody: "Your audio has finished processing and is now live on Sonar.",
      };
    case "new_post":
      return {
        title: "New voice post",
        body: `${actorName} just posted`,
        emailSubject: `${actorName} posted a new voice on Sonar`,
        emailBody: `${actorName} just published a new voice post. Open Sonar to listen.`,
      };
    case "login":
      return {
        title: "New login detected",
        body: `Your account was just accessed from a new device or location. If this wasn't you, please secure your account.`,
        emailSubject: "New login to your Sonar account",
        emailBody: "We noticed a new login to your Sonar account from an unrecognized device or location. If this was you, no action is needed. If you don't recognize this activity, please log in to your account and change your password immediately.",
      };
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
};

const cleanStaleToken = (userId: MongoId, token: string) =>
  User.findByIdAndUpdate(userId, { $pull: { fcmTokens: token } }).catch(console.error);

export interface DispatchParams {
  recipientId: MongoId;
  actorId?: MongoId | null;
  type: NotificationType;
  voicePostId?: MongoId;
  reactionType?: ReactionType;
}

export const dispatch = async ({ recipientId, actorId, type, voicePostId, reactionType }: DispatchParams): Promise<void> => {
  const recipient = await User.findById(recipientId).lean();
  if (!recipient) return;

  let actorName = "Someone";
  let actorUsername: string | null = null;
  let actorDisplayName: string | null = null;

  if (actorId) {
    const actor = await User.findById(actorId).select("username displayName").lean();
    if (actor) {
      actorName = actor.displayName || actor.username || "Someone";
      actorUsername = actor.username ?? null;
      actorDisplayName = actor.displayName ?? null;
    }
  }

  const notification = await Notification.create({
    recipientId,
    actorId,
    type,
    voicePostId: voicePostId || null,
    reactionType: reactionType || null,
    actorUsername,
    actorDisplayName,
  });

  const payload = buildPayload(type, { actorName, reactionType });

  const fcmTokens = recipient.fcmTokens || [];
  if (fcmTokens.length > 0) {
    const fcmData: Record<string, unknown> = {
      notificationId: String(notification._id),
      type,
      ...(voicePostId ? { voicePostId: String(voicePostId) } : {}),
    };

    const results = await Promise.allSettled(
      fcmTokens.map(token => sendPushNotification(token, payload.title, payload.body, fcmData))
    );

    results.forEach((result, i) => {
      if (result.status === "fulfilled" && result.value && typeof result.value === 'object' && 'staleToken' in result.value) {
        cleanStaleToken(recipientId, fcmTokens[i]);
      }
    });
  }

  if (recipient.email) {
    sendNotificationEmail(recipient.email, payload.emailSubject, payload.emailBody)
      .catch(err => console.error("Notification email failed:", err));
  }
};

export const notifyReaction = (recipientId: MongoId, actorId: MongoId, voicePostId: MongoId, reactionType: ReactionType) =>
  addNotificationJob('notifyReaction', { recipientId: String(recipientId), actorId: String(actorId), type: "reaction", voicePostId: String(voicePostId), reactionType })
    .catch(err => console.error("notifyReaction failed:", err));

export const notifyNewFollower = (recipientId: MongoId, actorId: MongoId) =>
  addNotificationJob('notifyNewFollower', { recipientId: String(recipientId), actorId: String(actorId), type: "new_follower" })
    .catch(err => console.error("notifyNewFollower failed:", err));

export const notifyUploadComplete = (recipientId: MongoId) =>
  addNotificationJob('notifyUploadComplete', { recipientId: String(recipientId), actorId: null, type: "upload_complete" })
    .catch(err => console.error("notifyUploadComplete failed:", err));

export const notifyLogin = (recipientId: MongoId) =>
  addNotificationJob('notifyLogin', { recipientId: String(recipientId), actorId: null, type: "login" })
    .catch(err => console.error("notifyLogin failed:", err));

export const notifyFollowersNewPost = async (actorId: MongoId, voicePostId: MongoId): Promise<void> => {
  try {
    const followers = await Follow.find({ following: actorId }).select("follower").lean();
    followers.forEach(f =>
      addNotificationJob('notifyNewPost', { recipientId: String(f.follower), actorId: String(actorId), type: "new_post", voicePostId: String(voicePostId) })
        .catch(err => console.error("notifyFollowersNewPost enqueue failed:", err))
    );
  } catch (err) {
    console.error("notifyFollowersNewPost failed:", err);
  }
};
