// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// Initialize cloud functions services. We can use this object for creating the cloud functions in the code.
const functions = require('firebase-functions');


// firebase admin SDK to access the firebase firestore database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
admin.firestore().settings({timestampsInSnapshots: true,});


const algoliasearch = require("algoliasearch");


// This is your unique application identifier. It's used to identify you when using Algolia's API.
const APPLICATION_ID = "03FEFCHVWW";

// This is the ADMIN API key. This secret key is used to create, update and DELETE your indices.
const ADMIN_API_KEY = "0472cce5fd0f92cd6723dfbca2da7a33";

// initialize the client.
const client = algoliasearch(APPLICATION_ID, ADMIN_API_KEY);


// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// we should refer this site  https://firebase.google.com/docs/reference/functions/providers_firestore.documentbuilder.html#oncreate
// To define a Cloud Firestore trigger, specify a document path and an event type.
// "onWrite" means create, delete or update the document.
exports.firestoreOnWrite = functions.firestore.document('/momos_v/{docID}').onWrite( async (document, context) => {

        // initialize the index with the same name as of the collection in firestore.
        const index = client.initIndex('players_new');

        // after the change, if the document exists, then copy the document to algolia.
        if (document.after.exists) {
            console.log('copying to Algolia');

            // after the change, data of the document object will be saved.
            newDataObjectForAlgolia = document.after.data();

            // set the "objectID" for algolia. It will be set same as the document id in firestore.
            newDataObjectForAlgolia.objectID = document.after.id;

            // ---------------------------------------------------------------------------------------------
            // Note:- See the syntax in cloud function documentation.
            // we get an object representing the current document
            // const newValue = change.after.data();

            // or we get the previous value before this update
            // const previousValue = change.before.data();
            // ---------------------------------------------------------------------------------------------

            // saved object will be returned with this function. It will be accessed when the promise gets completed.
            await index.saveObject(newDataObjectForAlgolia)
                    .then((successObject) => {

                        console.log('add to Algolia successful');
                        console.log(newDataObjectForAlgolia);
                        console.log(successObject);
                    })
                    .catch((error) => {
                        console.log('Algolia saveobject failed', error);
                    });
        }
        // if the document is deleted in the firestore, then use that "document id" and delete the same document in algolia.
        else {
            console.log('deleting from algolia');
            await index.deleteObject(document.after.id)
                    .then((successObject) => {
                        console.log('delete from Algolia is successful');
                        console.log(successObject)
                    })
                    .catch((error) => {
                        console.log('algolia deleteObject failed', error);
                    });
        }
});