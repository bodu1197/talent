
const lucide = require('lucide-react');
if (lucide.Handshake) {
    console.log('Handshake exists');
} else {
    console.log('Handshake DOES NOT exist');
    console.log('Available keys:', Object.keys(lucide).slice(0, 20));
}
