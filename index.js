const { Bot, webhookCallback, Keyboard, replyMarkup, session } = require("grammy");
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const moment = require("moment");
const cron = require('cron');



// ========================== import ==========================
const { namaBulan, tanggalLengkap, namaHari } = require('./waktu');
const jadwalSholat = require("./jadwalSholat");
const runJadwalCron = require("./notifikasi");
const database = require('./db');
const setLokasi = require('./setLokasi');




require("dotenv").config();

const bot = new Bot(process.env.TELEGRAM_TOKEN);
const sholat = process.env.SHOLAT;

const app = express();

app.use(bodyParser.json());
app.use(cors());

// ========================== function ==========================
async function db(ctx) {
    const id_telegram = ctx.chat.id;
    const snapshot = await database.where('id_telegram', '==', id_telegram).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return data;
}






// ========================== BOT ==========================
const menu = new Keyboard()
    .text("Jadwal Sholat")
    .text("Set Lokasi").row()
    .text("Notifikasi")
    .text("Setting").row()
    .text("Panduan")
    .resized();


bot.command("start", async (ctx) => {
    const dbLength = await db(ctx);
    if (dbLength.length == 0) {
        // masukan data pengguna ke database
        const data = {
            "id_telegram": ctx.from.id,
            "namaDepan": ctx.from.first_name,
            "namaBelakang": ctx.from.last_name,
            "username": ctx.from.username,
            "kota": false,
            "notifikasi": true
        }

        await database.add(data);
    }

    await bot.api.sendMessage(ctx.from.id, `Halo ${ctx.from.first_name}, Selamat datang di bot ini. Silahkan pilih menu dibawah ini`, {
        reply_markup: menu
    });
});



bot.hears("Jadwal Sholat", async (ctx) => {
    jadwalSholat.jadwalSholat(ctx);

    await bot.api.sendMessage(ctx.from.id, await jadwalSholat.jadwalSholat(ctx), {
        parse_mode: 'HTML',
        reply_markup: menu,
    });
});


bot.hears("Notifikasi", async (ctx) => {
    const notifikasiJadwalSholat = {
        subuh: '15:19', // waktu sholat subuh
        dzuhur: '15:20', // waktu sholat dzuhur
        ashar: '15:23', // waktu sholat ashar
        isya: '20:00', // waktu sholat isya
        maghrib: '18:30', // waktu sholat maghrib
    };
    runJadwalCron.runJadwalCron(806781448, notifikasiJadwalSholat);

});


























bot.hears("Setting", async (ctx) => {
    await bot.api.sendMessage(ctx.from.id, `Sedang dalam pengembangan`, {
        reply_markup: menu
    });
});

bot.on('message', async (ctx) => {
    if (ctx.message.text === 'Set Lokasi' || (ctx.message.location && ctx.message.reply_to_message)) {
        await bot.api.sendMessage(ctx.from.id, await setLokasi.setLokasi(ctx), {
            parse_mode: 'HTML',
            reply_markup: menu,
        });
    } else if (ctx.message.text === 'Batal') {
        await bot.api.sendMessage(ctx.from.id, `Kembali ke menu utama`, {
            reply_markup: menu
        });
    }

    else {
        ctx.reply('Maaf, perintah tidak dikenali');
    }
});






// menjalankan bot
if (process.env.NODE_ENV === "production") {
    app.use(express.json());
    app.use(webhookCallback(bot, "express"));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Bot listening on port ${PORT}`);
    });
} else {
    bot.start();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Bot listening on port ${PORT} ❤❤🧡🧡`);
    });
}

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));