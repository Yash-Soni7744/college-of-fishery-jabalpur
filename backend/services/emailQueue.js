const Queue = require('bull');
const nodemailer = require('nodemailer');

// Create email queue with Redis connection
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
console.log('Connecting to Redis:', redisUrl);

const emailQueue = new Queue('email', redisUrl, {
  redis: {
    tls: {
      rejectUnauthorized: false
    },
    enableOfflineQueue: true, 
    maxRetriesPerRequest: 3
  }
});

// Handle Redis connection errors
emailQueue.on('error', (error) => {
  console.error('Email queue error:', error.message);
});

emailQueue.on('waiting', (jobId) => {
  console.log(`📧 Email job ${jobId} is waiting in queue`);
});

emailQueue.on('active', (job) => {
  console.log(`🔄 Processing email job ${job.id} - To: ${job.data.mailOptions.to}`);
});

// Create transporter
const createTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };
  
  // Log config (without password)
  console.log('Email transporter config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    passConfigured: !!config.auth.pass
  });
  
  return nodemailer.createTransport(config);
};

// Process email jobs
emailQueue.process(async (job) => {
  const { mailOptions } = job.data;
  
  console.log(`Processing email job ${job.id} - To: ${mailOptions.to}, Subject: ${mailOptions.subject}`);
  
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Email sent successfully: ${info.messageId} to ${mailOptions.to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`✗ Error sending email (job ${job.id}):`, error.message);
    throw error; // Bull will retry the job
  }
});

// Event handlers for monitoring
emailQueue.on('completed', (job, result) => {
  console.log(`Email job ${job.id} completed:`, result.messageId);
});

emailQueue.on('failed', (job, err) => {
  console.error(`Email job ${job.id} failed:`, err.message);
});

emailQueue.on('stalled', (job) => {
  console.warn(`Email job ${job.id} stalled`);
});

// Add email to queue with fallback to direct sending if Redis unavailable
const queueEmail = async (mailOptions, options = {}) => {
  try {
    console.log(`Queueing email to: ${mailOptions.to}, Subject: ${mailOptions.subject}`);
    
    const job = await emailQueue.add(
      { mailOptions },
      {
        attempts: 3, // Retry 3 times
        backoff: {
          type: 'exponential',
          delay: 5000 // Start with 5 second delay
        },
        removeOnComplete: true, // Clean up after success
        removeOnFail: false, // Keep failed jobs for inspection
        timeout: 60000, // 60 second timeout
        ...options
      }
    );
    console.log(`✓ Email queued successfully - Job ID: ${job.id}`);
    return job.id;
  } catch (error) {
    console.error('✗ Error queueing email:', error.message);
    
    // Fallback: Send email directly if Redis is unavailable
    if (error.message.includes('ECONNREFUSED') || error.message.includes('Redis')) {
      console.log('⚠ Redis unavailable, sending email directly (synchronous)...');
      try {
        const transporter = createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log(`✓ Email sent directly: ${info.messageId} to ${mailOptions.to}`);
        return `direct-${Date.now()}`;
      } catch (sendError) {
        console.error('✗ Failed to send email directly:', sendError.message);
        throw sendError;
      }
    }
    
    throw error;
  }
};

// Graceful shutdown
const closeQueue = async () => {
  await emailQueue.close();
};

module.exports = {
  emailQueue,
  queueEmail,
  closeQueue
};
