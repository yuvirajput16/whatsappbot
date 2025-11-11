import cron from "node-cron";

export default function Scheduler() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();

    const dueReminders = await prisma.reminder.findMany({
      where: {
        time: {
          lte: now,
        },
      },
    });

    dueReminders.forEach(async (reminder) => {
      await twilioClient.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: reminder.phone,
        body: `Reminder: ${reminder.message}`,
      });

      await prisma.reminder.delete({
        where: { id: reminder.id },
      });
    });
  });
}
