const admin = require("firebase-admin");

// ========================== Firebase ==========================
const serviceAccount = require("./secret-autentification-firebase-adminsdk-ivt67-9c76eaf9fb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const database = admin.firestore();
const Data = database.collection('Data');

module.exports = Data;