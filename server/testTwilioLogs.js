require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function checkLogs() {
  console.log("Fetching recent SMS logs...");
  try {
    const messages = await client.messages.list({ limit: 5 });
    messages.forEach(m => {
      console.log(`[SMS] To: ${m.to} | Status: ${m.status} | ErrorCode: ${m.errorCode} | ErrorMessage: ${m.errorMessage}`);
    });
  } catch (e) {
    console.error("SMS Log Error:", e.message);
  }

  console.log("\nFetching recent Call logs...");
  try {
    const calls = await client.calls.list({ limit: 5 });
    calls.forEach(c => {
      console.log(`[Call] To: ${c.to} | Status: ${c.status} | Duration: ${c.duration} | Answered By: ${c.answeredBy}`);
    });
  } catch (e) {
    console.error("Call Log Error:", e.message);
  }
}

checkLogs();
