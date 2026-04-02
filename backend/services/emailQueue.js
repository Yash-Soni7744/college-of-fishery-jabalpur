const nodemailer = require('nodemailer');

// In serverless environments (Vercel), Bull queues cause duplicate emails
// because multiple function instances process the same queued jobs.
// We send directly instead.
const isServerless = process.env.VERCEL || process.env.NODE_ENV === 'production';

let Queue, emailQueue;

if (!isServerless) {
  // Only use Bull queue in local development (long-running server)
  Queue = require('bull');
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  console.log('DEV: Connecting to Redis queue:', redisUrl);

  emailQueue = new Queue('email', redisUrl, {
    redis: { tls: { rejectUnauthorized: false }, enableOfflineQueue: true, maxRetriesPerRequest: 3 }
  });

  emailQueue.on('error', (error) => console.error('Email queue error:', error.message));

  const createTransporterDev = () => nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });

  emailQueue.process(async (job) => {
    const { mailOptions } = job.data;
    const transporter = createTransporterDev();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Email sent (queue): ${info.messageId} to ${mailOptions.to}`);
    return { success: true, messageId: info.messageId };
  });

  emailQueue.on('completed', (job, result) => console.log(`Email job ${job.id} completed:`, result.messageId));
  emailQueue.on('failed', (job, err) => console.error(`Email job ${job.id} failed:`, err.message));
}

// Create transporter
const createTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// Send email directly (production/Vercel) OR queue it (local dev)
const queueEmail = async (mailOptions) => {
  if (isServerless) {
    // PRODUCTION: Send directly — no queue, no retries, no duplicates
    try {
      console.log(`📧 Sending email directly to: ${mailOptions.to}`);
      const transporter = createTransporter();
      const info = await transporter.sendMail(mailOptions);
      console.log(`✓ Email sent: ${info.messageId} to ${mailOptions.to}`);
      return `direct-${info.messageId}`;
    } catch (error) {
      console.error(`✗ Failed to send email to ${mailOptions.to}:`, error.message);
      throw error;
    }
  } else {
    // LOCAL DEV: Use Bull queue with 1 attempt only
    try {
      const job = await emailQueue.add(
        { mailOptions },
        { attempts: 1, removeOnComplete: true, removeOnFail: false, timeout: 60000 }
      );
      console.log(`✓ Email queued - Job ID: ${job.id}`);
      return job.id;
    } catch (error) {
      console.error('Queue error, sending directly:', error.message);
      const transporter = createTransporter();
      const info = await transporter.sendMail(mailOptions);
      return `direct-${info.messageId}`;
    }
  }
};

const closeQueue = async () => {
  if (emailQueue) await emailQueue.close();
};

module.exports = { emailQueue, queueEmail, closeQueue };
