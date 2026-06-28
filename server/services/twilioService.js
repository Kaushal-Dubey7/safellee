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

// ─── XML ESCAPE — prevents & < > " ' in names/addresses from breaking TwiML ──
const xmlEscape = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// ─── AUTO CALL VIA TWILIO (browser fallback when APK not available) ───
const makeEmergencyCall = async (toPhone, userName, lat, lng, address = 'an unknown location') => {
  try {
    const formattedPhone = formatPhoneForTwilio(toPhone);
    const safeName = xmlEscape(userName || 'A Safelle user');
    const safeAddress = xmlEscape(address || 'an unknown location');

    // Exact required message with a short pause before speaking so
    // the very first word is never clipped by the call connecting
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Pause length="1"/>
  <Say voice="Polly.Aditi" language="en-IN">
    Emergency Alert from Safelle. ${safeName} may be in danger. Her last known location is near ${safeAddress}.
  </Say>
  <Pause length="1"/>
  <Say voice="Polly.Aditi" language="en-IN">
    Repeating. Emergency Alert from Safelle. ${safeName} may be in danger. Her last known location is near ${safeAddress}.
  </Say>
</Response>`;

    console.log(`📞 Placing Twilio voice call to ${formattedPhone} with message for ${safeName}`);

    const call = await client.calls.create({
      twiml: twiml,
      to: formattedPhone,
      from: TWILIO_NUMBER
    });

    console.log(`✅ Twilio call created — SID: ${call.sid}, status: ${call.status}`);
    return { success: true, sid: call.sid, status: call.status };

  } catch (err) {
    console.error(`❌ Twilio call FAILED to ${toPhone}`);
    console.error(`   Error code: ${err.code}`);
    console.error(`   Error message: ${err.message}`);
    console.error(`   More info: ${err.moreInfo || 'n/a'}`);
    return { success: false, error: err.message, code: err.code };
  }
};

// ─── MAKE CALLS TO ALL CONTACTS ───────────────────────────────────────
const callAllContacts = async (contacts, userName, lat, lng, address) => {
  const results = [];
  
  for (const contact of contacts) {
    const result = await makeEmergencyCall(contact.phone, userName, lat, lng, address);
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
  client,
  sendSOSToAllContacts,
  callAllContacts,
  alertPoliceStation,
  sendEmergencySMS,
  makeEmergencyCall,
  formatPhoneForTwilio
};
