const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const uid = "mHJ7yUQzo0V8UqTVee7mLvkW17L2";

admin.auth().setCustomUserClaims(uid, { admin: true })
    .then(() => {
        console.log("✅ Admin claim set successfully.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Error setting claim:", error);
        process.exit(1);
    });