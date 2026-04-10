const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TWILIO_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const formatPhoneForTwilio = (phone) => {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '+91' + cleaned.slice(1);
  }
  if (cleaned.length === 10 && !cleaned.startsWith('+')) {
    cleaned = '+91' + cleaned;
  }
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
};

// ─── SEND EMERGENCY SMS TO ONE CONTACT ───────────────────────────────
const sendEmergencySMS = async (toPhone, userName, lat, lng) => {
  try {
    const formattedPhone = formatPhoneForTwilio(toPhone);
    const mapLink = `https://maps.google.com/?q=${lat},${lng}`;
    
    const message = 
      `🚨 SAFELLE EMERGENCY ALERT 🚨\n` +
      `${userName} needs immediate help!\n` +
      `📍 Last Location: ${mapLink}\n` +
      `⏰ Time: ${new Date().toLocaleTimeString('en-IN')}\n` +
      `Please check on her immediately or call 112.`;

    const result = await client.messages.create({
      body: message,
      from: TWILIO_NUMBER,
      to: formattedPhone
    });

    console.log(`✅ SMS sent to ${formattedPhone} | SID: ${result.sid}`);
    return { success: true, sid: result.sid };

  } catch (err) {
    console.error(`❌ SMS failed to ${toPhone}:`, err.message);
    return { success: false, error: err.message };
  }
};

// ─── SEND SMS TO ALL CONTACTS ─────────────────────────────────────────
const sendSOSToAllContacts = async (contacts, userName, lat, lng) => {
  const results = await Promise.allSettled(
    contacts.map(contact => 
      sendEmergencySMS(contact.phone, userName, lat, lng)
    )
  );

  const sent     = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed   = results.length - sent;

  console.log(`SOS SMS Results: ${sent} sent, ${failed} failed`);
  return { sent, failed, total: results.length };
};

// ─── AUTO CALL VIA TWILIO (browser fallback when APK not available) ───
const makeEmergencyCall = async (toPhone, userName, lat, lng) => {
  try {
    const formattedPhone = formatPhoneForTwilio(toPhone);
    const mapLink = `https://maps.google.com/?q=${lat},${lng}`;
    
    // TwiML — what Twilio says when contact picks up
    const twiml = `
      <Response>
        <Say voice="alice" language="en-IN">
          Emergency Alert from Safelle. 
          ${userName} may be in danger and needs your help immediately.
          Her last known location has been sent to your phone via SMS.
          Please check on her or call one one two immediately.
          This message will repeat.
        </Say>
        <Pause length="1"/>
        <Say voice="alice" language="en-IN">
          Emergency Alert from Safelle. 
          ${userName} may be in danger.
          Please check your SMS for her location.
        </Say>
      </Response>
    `;

    const call = await client.calls.create({
      twiml: twiml,
      to: formattedPhone,
      from: TWILIO_NUMBER
    });

    console.log(`✅ Call initiated to ${formattedPhone} | SID: ${call.sid}`);
    return { success: true, sid: call.sid };

  } catch (err) {
    console.error(`❌ Call failed to ${toPhone}:`, err.message);
    return { success: false, error: err.message };
  }
};

// ─── MAKE CALLS TO ALL CONTACTS ───────────────────────────────────────
const callAllContacts = async (contacts, userName, lat, lng) => {
  const results = [];
  
  for (const contact of contacts) {
    const result = await makeEmergencyCall(contact.phone, userName, lat, lng);
    results.push({ contact: contact.name, ...result });
    // Small delay between calls to avoid Twilio rate limiting
    await new Promise(r => setTimeout(r, 2000));
  }

  return results;
};

// ─── SEND ALERT TO NEAREST POLICE STATION ────────────────────────────
const alertPoliceStation = async (policePhone, userName, lat, lng) => {
  if (!policePhone) {
    console.log('No police phone number available, skipping');
    return { success: false, reason: 'No phone number' };
  }
  
  return await sendEmergencySMS(policePhone, userName, lat, lng);
};

module.exports = {
  sendSOSToAllContacts,
  callAllContacts,
  alertPoliceStation,
  sendEmergencySMS,
  makeEmergencyCall,
  formatPhoneForTwilio
};
