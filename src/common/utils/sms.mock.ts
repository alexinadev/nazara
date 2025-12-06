export class MockSMSProvider {
  async sendSMS(phone: string, message: string) {
    // In prod integrate Twilio or similar. For now just console.log
    console.log(`[MockSMS] Sent to ${phone}: ${message}`);
    return true;
  }
}
