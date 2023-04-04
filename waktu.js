const moment = require("moment");
const hijri = require('moment-hijri');


function momen(ctx) {
    moment.locale("id"); // Atur lokal bahasa Indonesia
    
    const sekarang = moment();
    
    // tanggal islam
    const tanggalIslam = hijri().format('iD iMMMM iYYYY');
    const tanggalIslamBesok = hijri().add(1, 'days').format('iD iMMMM iYYYY');


    // tanggal masehi
    const tanggalLengkap = moment().format("YYYY/MM/DD");
    const tanggalSekarang = moment().locale('id').format('dddd, DD MMMM YYYY');
    const besok = moment().add(1, 'days').format('YYYY/M/DD');
    const tanggalLengkapBesok = moment().add(1, 'days').format('YYYY/MM/DD');


    const namaBulan = sekarang.format("MMMM");
    const namaHari = sekarang.format("dddd");

    const waktu = () => {
        return {
            namaBulan, tanggalLengkap, namaHari, tanggalSekarang, tanggalIslam, besok, tanggalLengkapBesok, tanggalIslamBesok 
        }
    }

    return waktu(); // Contoh output: "April"
}

module.exports = momen();