const database = require('./db');
const { Keyboard } = require("grammy");


const menu = new Keyboard()
    .text("Jadwal Sholat")
    .text("Set Lokasi").row()
    .text("Notifikasi")
    .text("Setting").row()
    .text("Panduan")
    .resized();

async function db(id_telegram) {
    const snapshot = await database.where('id_telegram', '==', id_telegram).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return data;
}

async function setLokasi(ctx) {
    const message = ctx.message;
    const location = ctx.message.location;

    // Cek apakah pesan yang diterima adalah balasan
    if (message.reply_to_message && location) {
        const message = ctx.message;
        const latitude = message.location.latitude;
        const longitude = message.location.longitude;

        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
            const response = await fetch(url);
            const data = await response.json();

            const county = data.address.county;
            data.kota = county;

            // update data di database
            const dbUp = await db(ctx.from.id);
            const dbUpdate = dbUp[0].id;

            var kabupaten = `KAB. ${county.toUpperCase()}`

            const semuaKab = 'https://api.myquran.com/v1/sholat/kota/semua';
            const res = await fetch(semuaKab);
            const dataKab = await res.json();
            var idKab = 0;

            for (let i = 0; i < dataKab.length; i++) {
                const kab = dataKab[i];
                if (kab.lokasi == kabupaten) {
                    idKab = kab.id;
                }
            }

            database.doc(dbUpdate).update({ 
                "kota": true,
                "lokasi": {
                    "kota": kabupaten, 
                    "idKab": idKab, 
                    "desa": data.address.suburb, 
                    "provinsi": data.address.state,
                    "negara": data.address.country
                }
            }).then(() => {
                console.log("Data berhasil diupdate!");
            }).catch((error) => {
                console.error("Error mengupdate data: ", error);
            });

            await ctx.reply( `Lokasi Anda:
${data.address.suburb}, ${data.address.county}, ${data.address.state}, ${data.address.country}
Lintang: ${data.lat}
Bujur: ${data.lon}
            
Jadwal Waktu Sholat Anda telah di-set sesuai lokasi tersebut, bila Anda bepergian keluar kota/kabupaten segera Set Lokasi Anda kembali.`, {
                parse_mode: "HTML",
                reply_markup: menu
            });
        } catch (error) {
            console.error(error);
            await ctx.reply('Maaf, terjadi kesalahan dalam memproses lokasi Anda');
        }
    } else if (ctx.message.text == 'Set Lokasi') {
        ctx.reply('Klik Share Lokasi untuk set ulang penghitungan waktu jadwal sholat sesuai lokasi Anda terkini. \n\nIzinkan Telegram untuk akses lokasi Anda.', {
            // tampilkan keyboard untuk meminta lokasi pengguna
            reply_markup: {
                keyboard: [[{ text: 'Kirim Lokasi', request_location: true }, { text: 'Batal' }]],
                resize_keyboard: true
            },
        });
    }
}


module.exports = {
    setLokasi
};