import env from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import { PrismaClient } from "@prisma/client";
import moment from "moment";
import Scheduler from "./reminders/scheduler";

env.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const prisma = new PrismaClient();

const port = process.env.PORT || 3000;

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const createTable = async () => {
  console.log("Prisma is managing the tables.");
};

app.post("/whatsapp", async (req, res) => {
  const incomingMessage = req.body.Body.toLowerCase();
  const from = req.body.From;

  let responseMessage;

  if (incomingMessage === "hello") {
    responseMessage =
      'Hello! Would you like to set a reminder or exit? Please reply with "set reminder" or "exit".';
  } else if (incomingMessage === "set reminder") {
    responseMessage =
      "Please enter the time for the reminder (in 24-hour format or 12-hour format with AM/PM).";
    reminders[from] = { stage: "awaiting_time" };
  } else if (reminders[from]?.stage === "awaiting_time") {
    let reminderTime;

    reminderTime = moment(incomingMessage, "HH:mm", true);

    if (!reminderTime.isValid()) {
      reminderTime = moment(incomingMessage, "h:mm A", true);
    }
    if (!reminderTime.isValid()) {
      responseMessage =
        'Invalid time format. Please enter the time in 24-hour format (e.g., "14:00") or 12-hour format with AM/PM (e.g., "2:00 PM").';
    } else {
      reminders[from] = {
        stage: "awaiting_message",
        time: reminderTime.format("YYYY-MM-DD HH:mm:ss"), 
      };
      responseMessage = "Please enter the reminder message.";
    }
  } else if (reminders[from]?.stage === "awaiting_message") {
    const reminderMessage = incomingMessage;
    const reminderTime = reminders[from].time;
    const phoneNumber = from;

    await prisma.reminder.create({
      data: {
        phone: phoneNumber,
        time: new Date(reminderTime),
        message: reminderMessage,
      },
    });

    responseMessage = `Reminder set for ${reminderTime}.`;
    delete reminders[from];
  } else if (incomingMessage === "exit") {
    responseMessage = "Goodbye!";
  } else {
    responseMessage =
      'Sorry, I did not understand that. Please reply with "hi" to start over.';
  }

  twilioClient.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to: from,
    body: responseMessage,
  });
  res.send("<Response></Response>");
});

Scheduler();

app.get("/", (req, res) => {
  res.send("Hosted");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
