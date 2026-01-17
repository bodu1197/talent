/**
 * Apple Sign In Client Secret Generator
 *
 * This script generates a JWT client secret for Apple Sign In with Supabase
 */

const crypto = require('crypto');

// Apple Developer 정보
const TEAM_ID = 'MM97G37XFT';
const KEY_ID = '2L7PBRZ5KB';
const CLIENT_ID = 'com.dolpagu.webapp'; // Service ID

// Private Key (from .p8 file)
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgkxDU5ZPiCAn1kd3Y
BtVCzqRPIFVAIllri+UbeNrpaRKgCgYIKoZIzj0DAQehRANCAASZ4k9KY+zeKaJO
aS8/eySe+MqCgQkiipeCoqOXFoaTHi+hpGcVjxh7X4YvUKsy2ut6/pCzsP8rpG3R
rdjHdsRv
-----END PRIVATE KEY-----`;

function base64UrlEncode(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function generateAppleClientSecret() {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 180 * 24 * 60 * 60; // 180 days (Apple allows up to 6 months)

  // JWT Header
  const header = {
    alg: 'ES256',
    kid: KEY_ID,
    typ: 'JWT',
  };

  // JWT Payload
  const payload = {
    iss: TEAM_ID,
    iat: now,
    exp: now + expiresIn,
    aud: 'https://appleid.apple.com',
    sub: CLIENT_ID,
  };

  // Encode header and payload
  const headerEncoded = base64UrlEncode(Buffer.from(JSON.stringify(header)));
  const payloadEncoded = base64UrlEncode(Buffer.from(JSON.stringify(payload)));

  // Create signature
  const signatureInput = `${headerEncoded}.${payloadEncoded}`;
  const sign = crypto.createSign('SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(PRIVATE_KEY);

  // Convert signature to base64url (need to handle DER format)
  const signatureEncoded = base64UrlEncode(signature);

  const jwt = `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`;

  console.log('\n========================================');
  console.log('🍎 Apple Client Secret Generated!');
  console.log('========================================\n');
  console.log('Team ID:', TEAM_ID);
  console.log('Key ID:', KEY_ID);
  console.log('Client ID:', CLIENT_ID);
  console.log('Expires:', new Date((now + expiresIn) * 1000).toISOString());
  console.log('\n========================================');
  console.log('📋 Copy this Secret Key to Supabase:');
  console.log('========================================\n');
  console.log(jwt);
  console.log('\n========================================\n');

  return jwt;
}

generateAppleClientSecret();
