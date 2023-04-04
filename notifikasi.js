const { Bot} = require("grammy");
const cron = require('cron');
const database = require('./db');
require("dotenv").config();

const bot = new Bot(process.env.TELEGRAM_TOKEN);

// Fungsi untuk mengirim pesan ke bot Telegram
const kirimPesan = async (chatId, pesan) => {
    await bot.api.sendMessage(chatId, pesan);
};

// Fungsi untuk mengonversi waktu jadwal sholat ke format timestamp
const jadwalToTimestamp = (jadwal) => {
    const today = new Date();
    const [hour, minute] = jadwal.split(':');
    today.setHours(hour, minute, 0, 0);
    console.log(today.getTime());
    return today.getTime();
};

// Fungsi untuk menjadwalkan notifikasi 1 menit sebelum waktu sholat
const notifikasi = async (chatId, jadwal) => {
    const jadwalTimestamp = jadwalToTimestamp(jadwal);
    const waktuNotifikasi = jadwalTimestamp - 60000; // notifikasi 1 menit sebelum waktu sholat
    const now = Date.now();

    if (now >= waktuNotifikasi && now < jadwalTimestamp) {
        const pesan = `Waktunya sholat ${jadwal} sebentar lagi!`;
        console.log(pesan);
        await kirimPesan(chatId, pesan);
    }
};

// Fungsi untuk menjalankan cron job
const runJadwalCron = (chatId, jadwalSholat) => {
    const jadwalCron = new cron.CronJob({
        cronTime: '0 * * * * *', // setiap menit
        onTick: () => {
            notifikasi(chatId, jadwalSholat.subuh);
            notifikasi(chatId, jadwalSholat.dzuhur);
            notifikasi(chatId, jadwalSholat.ashar);
            notifikasi(chatId, jadwalSholat.maghrib);
            notifikasi(chatId, jadwalSholat.isya);
        },
    });

    jadwalCron.start();
};

module.exports = {
    runJadwalCron
};
