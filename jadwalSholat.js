const { tanggalLengkap, tanggalSekarang, tanggalIslam, besok, tanggalLengkapBesok, tanggalIslamBesok } = require('./waktu');
const database = require('./db');
require('dotenv').config();

const sholat = process.env.SHOLAT;

async function db(id_telegram) {
    const snapshot = await database.where('id_telegram', '==', id_telegram).get();
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return data[0];
}

async function jadwalNotif(idKab) {
    // jadwal hari ini
    const jadwal = `${sholat}/sholat/jadwal/${idKab.lokasi.idKab}/${tanggalLengkap}`;
    const res = await fetch(jadwal);
    const data = await res.json();

    return data;
}

async function jadwalBesokNotif(idKab) {
    // jadwal besok
    const jadwalBesok = `${sholat}/sholat/jadwal/${idKab.lokasi.idKab}/${besok}`;
    const resBesok = await fetch(jadwalBesok);
    const dataBesok = await resBesok.json();
    return dataBesok;
}


async function jadwalSholat(ctx) {
    const idKab = await db(ctx.chat.id);




    if (idKab.kota === false) {
        var chat = `
        Anda belum menentukan lokasi.. 
Jadwal waktu sholat dihitung berdasarkan koordinat lokasi Anda.
Klik <b>Set Lokasi</b> dan izinkan Telegram untuk akses lokasi Anda.`;
        return chat;
    } else {

        // jadwal hari ini 
        const data = await jadwalNotif(idKab);

        // jadwal besok
        const dataBesok = await jadwalBesokNotif(idKab);

        const { desa, kota, provinsi, negara } = idKab.lokasi;

        const jadwal = data.data.jadwal;
        const jadwalBesok = dataBesok.data.jadwal;

        var chat = `
JADWAL SHOLAT HARI INI
${tanggalSekarang} | ${tanggalIslam}
${desa}, ${kota.toLowerCase()}, ${provinsi}, ${negara}

Imsak
---------------- ${await jadwal.imsak}
Shubuh
---------------- ${await jadwal.subuh}
Terbit
---------------- ${await jadwal.terbit}
Dzuhur         
---------------- ${await jadwal.dzuhur}
Ashar          
---------------- ${await jadwal.ashar}
Maghrib        
---------------- ${await jadwal.maghrib}
Isya           
---------------- ${await jadwal.isya}


BESOK, ${tanggalLengkapBesok} | ${tanggalIslamBesok}

Imsak
---------------- ${await jadwalBesok.imsak}
Shubuh
---------------- ${await jadwalBesok.subuh}
Terbit
---------------- ${await jadwalBesok.terbit}
Dzuhur          
---------------- ${await jadwalBesok.dzuhur}
Ashar           
---------------- ${await jadwalBesok.ashar}
Maghrib         
---------------- ${await jadwalBesok.maghrib}
Isya            
---------------- ${await jadwalBesok.isya}


Koordinat: ${await data.data.koordinat.lat}, ${await data.data.koordinat.lon}
Metode Kalkulasi: Kementerian Agama RI
Metode Juristik: Standar (Syafi'i, Maliki, Hanbali)`

        return chat;
    }
}

module.exports = {
    jadwalSholat, jadwalNotif
};
