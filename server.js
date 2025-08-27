import env from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import pg from "pg";
import cron from "node-cron";
import moment from "moment";

env.config();
const app = express();
const initDB = app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

const port = process.env.PORT || 3000;

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const createTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS reminders (
      id SERIAL PRIMARY KEY,
      phone VARCHAR(20),
      time TIMESTAMP,
      message TEXT
    );
  `);
  console.log("Table created successfully");
};

createTable();

const reminders = {};

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
        time: reminderTime.format("YYYY-MM-DD HH:mm:ss"), // Store the timestamp in a valid format
      };
      responseMessage = "Please enter the reminder message.";
    }
  } else if (reminders[from]?.stage === "awaiting_message") {
    const reminderMessage = incomingMessage;
    const reminderTime = reminders[from].time;
    const phoneNumber = from;

    await db.query(
      "INSERT INTO reminders (phone_number, reminder_time, message) VALUES ($1, $2, $3)",
      [phoneNumber, reminderTime, reminderMessage]
    );

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

cron.schedule("* * * * *", async () => {
  const now = moment().format("YYYY-MM-DD HH:mm:ss");
  const reminders = await db.query(
    "SELECT * FROM reminders WHERE reminder_time <= $1",
    [now]
  );

  reminders.rows.forEach(async (reminder) => {
    await twilioClient.messages.create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: reminder.phone_number,
      body: `Reminder: ${reminder.message}`,
    });

    await db.query("DELETE FROM reminders WHERE id = $1", [reminder.id]);
  });
});
app.get("/", (req, res) => {
  res.send("Hosted");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
