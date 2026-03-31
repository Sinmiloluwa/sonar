import Waitlist from "../models/waitlist.js";
import { Request, Response } from "express";
import { sendNotificationEmail } from "../services/notificationEmail.js";

export const joinWaitlist = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body as { email: string };
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }

        const existingEntry = await Waitlist.findOne({ email });
        if (existingEntry) {
            res.status(400).json({ message: "Email already in waitlist" });
            return;
        }

        await Waitlist.create({ email });

        sendNotificationEmail(
            email,
            "You're on the Sonar waitlist!",
            "Thanks for joining the Sonar waitlist! We'll let you know as soon as you're in."
        ).catch((err) => console.error("Waitlist email failed:", err));

        res.status(201).json({ message: "Joined waitlist successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}