const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require("@whiskeysockets/baileys")

const P = require("pino")

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")

  const sock = makeWASocket({
    logger: P({ level: "silent" }),
    auth: state
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {

    if (qr) {
      console.log("Scan QR Code")
      console.log(qr)
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut

      if (shouldReconnect) {
        startBot()
      }
    }

    if (connection === "open") {
      console.log("BOT CONNECTED")
    }
  })

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]

    if (!m.message) return

    const msg =
      m.message.conversation ||
      m.message.extendedTextMessage?.text ||
      ""

    const from = m.key.remoteJid

    if (msg === ".ping") {
      await sock.sendMessage(from, {
        text: "🏓 Pong!"
      })
    }

    if (msg === ".menu") {
      await sock.sendMessage(from, {
        text:
`╔═══〔 AHAD MD BOT 〕═══╗
║ .ping
║ .menu
║ .owner
╚════════════════════╝`
      })
    }

    if (msg === ".owner") {
      await sock.sendMessage(from, {
        text: "Owner: Abdul Ahad"
      })
    }
    npx plugins add vercel/vercel-plugin
  })
}

startBot()
