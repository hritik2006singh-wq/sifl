const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const uid = "Vccl6vNfNwYR6BPDyhu28Vr2P3l1";

admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
        console.log("✅ Admin claim set successfully.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error setting claim:", error);
        process.exit(1);
    });