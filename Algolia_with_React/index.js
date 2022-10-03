const express = require("express");
const app = express();
const cors = require('cors');


// "bodyParser" middleware is responsible for parsing the incoming request bodies.
// If we don't use it, then we get "empty"/"undefined" when we print "req.body".
const bodyParser = require('body-parser');

// node has a feature called "streams" which helps to handle reading/writing the files.
// file system module helps to create "readstream" and "writestream" on a file. Then pipe() connects the "readstream" and "writestream".
const fs = require('fs');

// this module creates streamarray feature which helps to read huge json file.
const StreamArray = require('stream-json/streamers/StreamArray');

const algoliasearch = require("algoliasearch");
const { callbackify } = require("util");

// This is your unique application identifier. It's used to identify you when using Algolia's API.
const APPLICATION_ID = "03FEFCHVWW";

// This is the ADMIN API key. This secret key is used to create, update and DELETE your indices.
const ADMIN_API_KEY = "0472cce5fd0f92cd6723dfbca2da7a33";

// initialize the client.
const client = algoliasearch(APPLICATION_ID, ADMIN_API_KEY);

// initialize the index. Enter the correct index name.
const index = client.initIndex('testObjectsDetector');




// to invoke the json bodyparser, use "express.json" middleware.
app.use(express.json());
// to send requests from multiple different websites within the browser, we need "cors" middleware.
app.use(cors());
// "urlencoded" middleware gives the urlencoded form for the post request.
app.use(express.urlencoded({ extended: true }));


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// api for searching the data. Here, "index.search" method gives a promise, it gives data if the search gets that keyword.
app.get('/search', function(req, res) {
    const searchWord = req.query.searchItem;
    console.log("request query parameter is", searchWord);

    // Remember:- To have a "get" request, we should use query parameter. We can not send the "request body" in http get request.
    // If we use "req.body", then we should use "post request" and the request data should be in "json format".

    index.search(searchWord)
        .then(({hits}) => {
            if (hits.length) {
                var searchResults = [];
                
                hits.forEach(object => {
                    var individualObject = {
                        "videoID": object.videoID,
                        "userID": object.userID,
                        "type": object.type,
                        "entityDescription": object.entityDescription,
                        "entityID": object.entityID,
                        "startTime": object.startTime,
                        "endTime": object.endTime,
                        "duration": object.duration
                };

                searchResults.push(individualObject);

                });
        

                res.send({"search_results": searchResults});
                console.log(searchResults);
            // if the user doesn't provide any searchItem, then 
            } else {
                res.send("no results found");
                console.log("No results found");
            }
        })
        // if we have error in searching itself, then we get error.
        .catch(err => {
            console.log(err);
        });
});


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// api for saving the objects into the dataset.
app.post('/saveObject', async function(req, res) {
    object = req.body;
    await index.saveObject(object)
        .then((object) => {
        console.log(object)
        res.send({"saved_object": object})})
        .catch((err) => {
            console.log(err);
        });
});

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// api for uploading the .json file into the dataset. Don't use it because direct uploading is possible from firestore through cloud functions.
app.post('/upload', function(req, res) {

    // initialize the stream service which can read and write the given ".json" file.
    const stream = fs.createReadStream('actors.json').pipe(StreamArray.withParser());

    // this list holds the json objects.
    let chunks = [];

    // if "data" is the event(meaning stream service started reading the json file), then call a function which adds the json objects to the chunks list until there are 10,000 objects.
    // idea:- stream object starts reading the huge json file, if it reads first 10000 objects, then it pushes the data into the chunks list. Then to the index/dataset.
    stream.on('data', ({ value }) => {
        chunks.push(value);

        // if the chunks gets 10000 objects, then pause the push process. Save it to the index/dataset. Empty the chunks array. Again start appending the objects into the list.
        if (chunks.length === 10000) {
        stream.pause();

        index.saveObjects(chunks, { autoGenerateObjectIDIfNotExist: true })
            .then(() => {
            chunks = [];
            stream.resume();
            })
            .catch(console.error);
        }
    });

    // if "end" is the event, there may or may not be 10,000 objects. In that case, just save the file into the index/dataset.
    stream.on('end', () => {
        if (chunks.length) {
        index.saveObjects(chunks, { 
            autoGenerateObjectIDIfNotExist: true
        }).catch(console.error);
        }
    })

    // if file is not readable, or for any error, just print the error.
    stream.on('error', err => console.error(err));
});


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// api for Partially updating the multiple objects.
app.post('/partialUpdate', async function(req, res) {
    objectUpdateInfo = req.body;
    
    await index.partialUpdateObject(objectUpdateInfo)
        .then((object) => {
            console.log("updated successfully")
            res.send({"updated_object": object})})
        .catch(err => {
            console.log(err);
        });
});

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// api for deleting the object.
app.post('/deleteObject', async function(req, res) {
    objectID = req.body.objectID;
    try{
        await index.deleteObject(objectID)
            .then((object) => res.send({"object deleted": object}));
            console.log("object deleted");
    }
    catch{(err) => console.log(err)};
});

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------

var port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`listening on the port ${port}...`);
});

// -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
