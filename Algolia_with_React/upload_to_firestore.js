// first create/initialize the firebase admin in the code.
var admin = require("firebase-admin");


// create an object/initialize the service account. It is used for the app initialization.
var serviceAccount = require('./serviceaccountdetails.json');


// initialize the app using admin, service account, database url.
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://shiva-node-app-deployment-default-rtdb.firebaseio.com"
});


// initialize the firestore databse service in the code by creating the object.
const firestore = admin.firestore();


// path module is used to find the folder path where json files are kept.
const path = require("path");


// file system module is used to read the file.
const fs = require("fs");


// This is the path of the "files" directory where we keep a lot of json files.
const directoryPath = path.join(__dirname, "files");


// "readdir" function reads the folder and gives the list of file names in it. It is an array of String items.
// call another function which takes 2 parameters. One is for error and one for the list of string items.
// syntax:- fs.readdir( path, options, callback )
fs.readdir(directoryPath, (err, files) => {
  // if we get the error while reading the directory path itself, then print the error.
  if (err) {
    return console.log(err);
  }

  // if we read the files in the directory, then we get the list/array of file names.
  // Then for each file name, call another function which will create a file object.
  files.forEach((filename) => {
    // to get the index of "."
    // idea:- to make a substring and give the same name of the filename for the "firestore collection".
    var lastDotIndex = filename.lastIndexOf(".");

    // complete path of the file is obtained and an object is initialized from this. so it will be a file object.
    var file = require("./files/" + filename);

    // Remember:- The above "file" object is a json file. It will contain many dictionaries/documents.

    // Now, for each object/dictionary in the file, we should call a function.
    // it takes an object/dictionary. It sets the name of the file as collection, dictionary itemID as index, object as document.
    file.forEach((dict_object) => {
      // firestore object sets the collection, index and document. It is a promise object which takes time to get resolved then the below code will run.
      // substring method gives the substring of the string/filename.

      firestore.collection(filename.substring(0, lastDotIndex)).doc(dict_object.itemID).set(dict_object)
      .then(function(docRef) {
        console.log("Document written");
      })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
    });
  });
});

// -------------------------------------------------------------------------------------------------------------
