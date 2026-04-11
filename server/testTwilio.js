require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function testSMS() {
  try {
    const result = await client.messages.create({
      body: "🚨 SAFELLE EMERGENCY ALERT 🚨 Test from server.",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: "+918527348483"
    });
    console.log("Success:", result.sid);
  } catch (error) {
    console.error("Twilio API Error:");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error("More Info:", error.moreInfo);
  }
}

testSMS();
