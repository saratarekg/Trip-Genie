import {MongoClient} from "mongodb";
import { db, setDoc, doc , deleteDoc} from "../configs/firebaseConfig.js";

const MONGODB_URI = "mongodb+srv://abdelrahmanelsamalouty:43CUYkdy3iE62KNW@genie.2puej.mongodb.net/trip-genie?retryWrites=true&w=majority&appName=genie";

// Fetch data from MongoDB
async function fetchDataFromMongoDB() {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const database = client.db("trip-genie");

        // Fetch data from each collection
        const tourists = await database.collection("tourists").find({}).toArray();
        const tourguides = await database.collection("tourguides").find({}).toArray();
        const sellers = await database.collection("sellers").find({}).toArray();
        const advertisers = await database.collection("advertisers").find({}).toArray();

        return { tourists, tourguides, sellers, advertisers };
    } finally {
        await client.close();
    }
}

function transformData(data) {
    const users = [];

    // Add tourists
    data.tourists.forEach((doc) => {
        if (doc._id) {
            users.push({
                _id: doc._id.toString(),
                accessibility: doc.accessibility || null, // Default to null if accessibility is undefined
                dateOfBirth: doc.dateOfBirth,
            });
        }
    });

    // Add tourguides
    data.tourguides.forEach((doc) => {
        if (doc._id) {
            users.push({
                _id: doc._id.toString(),
                accessibility: doc.accessibility || null,
            });
        }
    });

    // Add sellers
    data.sellers.forEach((doc) => {
        if (doc._id) {
            users.push({
                _id: doc._id.toString(),
                accessibility: doc.accessibility || null,
            });
        }
    });

    // Add advertisers
    data.advertisers.forEach((doc) => {
        if (doc._id) {
            users.push({
                _id: doc._id.toString(),
                accessibility: doc.accessibility || null,
            });
        }
    });

    return users;
}


// Sync data to Firebase
async function syncToFirebase(users) {
    for (const user of users) {
        await setDoc(doc(db, "users", user._id), {
            _id: user._id,
            accessibility: user.accessibility,
            dateOfBirth: user.dateOfBirth || null
        });
    }

    console.log("Sync completed!");
}

// Watch for changes in MongoDB and update Firebase
async function watchForChanges() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const database = client.db("trip-genie");

        const collections = ["tourists", "tourguides", "sellers", "advertisers"];
        for (const collectionName of collections) {
            const collection = database.collection(collectionName);
            const changeStream = collection.watch();

            changeStream.on("change", async (change) => {
                console.log("Change detected:", change);

                const docId = change.documentKey._id.toString();

                if (change.operationType === "insert") {
                    // Handle insert operation
                    const docData = change.fullDocument;
                    const accessibility = docData.accessibility || null;

                    await setDoc(doc(db, "users", docId), {
                        _id: docId,
                        accessibility: accessibility,
                    });

                    console.log(`Inserted Firebase document: ${docId}`);
                } else if (change.operationType === "update") {
                    // Handle update operation
                    const updatedFields = change.updateDescription.updatedFields;

                    // Update only the fields that were changed
                    await setDoc(
                        doc(db, "users", docId),
                        {
                            ...updatedFields,
                        },
                        { merge: true } // Merge with existing document
                    );

                    console.log(`Updated Firebase document: ${docId}`);
                } else if (change.operationType === "delete") {
                    // Handle delete operation
                    await deleteDoc(doc(db, "users", docId));
                    console.log(`Deleted Firebase document: ${docId}`);
                }
            });
        }
    } catch (error) {
        console.error("Error watching for changes:", error);
    }
}
// Main function to run the sync
async function main() {
    try {
        // Fetch data from MongoDB
        const data = await fetchDataFromMongoDB();

        // Transform data
        const users = transformData(data);

        // Sync data to Firebase
        await syncToFirebase(users);

        // Start watching for changes
        await watchForChanges();
    } catch (error) {
        console.error("Error during sync:", error);
    }
}

// Run the sync script
main();