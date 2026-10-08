import express from "express";
import cors from "cors";
import QRCode from "qrcode";
import makeWASocket, { useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

let qrCodeData = null;
let isConnected = false;

async function startBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      if(qr) {
        qrCodeData = await QRCode.toDataURL(qr);
      }
      if(connection === 'open') {
        isConnected = true;
        qrCodeData = null;
        console.log("WhatsApp Connected!");
      }
      if(connection === 'close') {
        isConnected = false;
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
        if(shouldReconnect) startBot();
      }
    });
    sock.ev.on('messages.upsert', async m => {
      const msg = m.messages[0];
      if(!msg.key.fromMe && msg.message) {
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        if(text) {
          await sock.sendMessage(msg.key.remoteJid, { text: `Rorabot: ${text}` });
        }
      }
    });
  } catch(e){ console.log(e) }
}
startBot();

app.get("/", (req, res) => {
  if(isConnected) {
    res.send("<h1>✅ Rorabot Connected!</h1><p>Bot is running on WhatsApp!</p>");
  } else if(qrCodeData) {
    res.send(`<html><body style="text-align:center;font-family:sans-serif"><h1>Rorabot QR Code</h1><p>WhatsApp > Linked Devices > Link a Device se scan karo</p><img src="${qrCodeData}" style="width:300px;border:1px solid #000"/><br><br><a href="/">Refresh</a></body></html>`);
  } else {
    res.send("<h1>Starting Rorabot...</h1><p>10 second baad refresh karo, QR ayega!</p><a href='/'>Refresh</a>");
  }
});

app.get("/api/chat", (req,res)=> res.json({reply: "Rorabot is running!"}));
app.listen(PORT, "0.0.0.0", () => console.log(`Server on ${PORT}`));
