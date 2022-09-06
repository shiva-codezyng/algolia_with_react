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

// initialize the index. Enter the correct index name.
// const index = client.initIndex('video_info');

// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// exports.myFunction = functions.firestore
//   .document('my-collection/{docId}')
//   .onWrite((change, context) => { /* ... */ });



// To define a Cloud Firestore trigger, specify a document path and an event type:
exports.firestoreOnWrite = functions.firestore.document('momos_nv/{MOMOS_NV_101}').onWrite((change, context) => {

        // initialize the index with the same name as of the collection in firestore.
        const index = client.initIndex('momos_nv');

        // if the document has not been deleted
        if (change.after.exists) {
            console.log('copying to Algolia');
            newDataObjectForAlgolia = change.after.data();
            newDataObjectForAlgolia.objectID = change.after.id;

            return index.saveObject(newDataObjectForAlgolia)
                    .then((successObject) => {

                        console.log('add to Algolia successful');
                        console.log(newDataObjectForAlgolia);
                        console.log(successObject);
                    })
                    .catch((error) => {
                        console.log('Algolia saveobject failed', error);
                    });
        }
        // else {
        //     console.log('deleting from algolia');
        //     return index.deleteObject(change.after.id)
        //         .then((successObject) => {



        //             console.log('delete from Algolia is successful');
        //             console.log(successObject)
        //         })
        //         .catch((error) => {
        //             console.log('algolia deleteObject failed', error);
        //         });

        // }
});

