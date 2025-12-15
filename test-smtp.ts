
import * as net from 'net';

const SMTP_HOST = 'gmail-smtp-in.l.google.com';
const SMTP_PORT = 587;

console.log(`Testing connectivity to ${SMTP_HOST}:${SMTP_PORT}...`);

const socket = new net.Socket();
socket.setTimeout(5000);

socket.on('connect', () => {
    console.log('SUCCESS: Connected to Port 25! SMTP verification is possible.');
    socket.destroy();
});

socket.on('timeout', () => {
    console.log('FAILURE: Connection timed out. Port 25 is likely blocked by your ISP or firewall.');
    socket.destroy();
});

socket.on('error', (err) => {
    console.log(`FAILURE: Connection error: ${err.message}`);
});

socket.connect(SMTP_PORT, SMTP_HOST);
