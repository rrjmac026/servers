const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Initialize Firebase Admin SDK
let serviceAccount;

if (process.env.FIREBASE_CREDENTIALS) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  } catch (error) {
    console.error("❌ Error parsing FIREBASE_CREDENTIALS:", error);
    process.exit(1); // Stop execution if the JSON is invalid
  }
} else {
  serviceAccount = require("./ServiceKey.json"); // Use local file for development
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Firestore database instance

// 🔍 Test Firestore Connection
async function testFirestore() {
  try {
    const studentsRef = db.collection("students");
    const snapshot = await studentsRef.get();
    
    if (snapshot.empty) {
      console.log("❌ No students found in Firestore");
    } else {
      console.log("✅ Firestore Connected. Students List:");
      snapshot.forEach((doc) => console.log(doc.id, "=>", doc.data()));
    }
  } catch (error) {
    console.error("❌ Error connecting to Firestore:", error);
  }
}

testFirestore(); // ✅ Now it's after Firebase initialization

// 📌 Fetch all students from Firestore
app.get("/students", async (req, res) => {
  try {
    const studentsRef = db.collection("students");
    const snapshot = await studentsRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "No students found" });
    }

    let students = [];
    snapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(students);
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 🚀 Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
