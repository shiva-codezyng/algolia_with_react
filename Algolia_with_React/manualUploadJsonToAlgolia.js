const express = require("express");
const app = express();

// node has a feature called "streams" which helps to handle reading/writing the files.
// file system module helps to create "readstream" and "writestream" on a file. Then pipe() connects the "readstream" and "writestream".
const fs = require('fs');

// this module creates streamarray feature which helps to read huge json file.
const StreamArray = require('stream-json/streamers/StreamArray');

const algoliasearch = require("algoliasearch");


// This is your unique application identifier. It's used to identify you when using Algolia's API.
const APPLICATION_ID = "03FEFCHVWW";

// This is the ADMIN API key. This secret key is used to create, update and DELETE your indices.
const ADMIN_API_KEY = "0472cce5fd0f92cd6723dfbca2da7a33";

// initialize the client.
const client = algoliasearch(APPLICATION_ID, ADMIN_API_KEY);

// initialize the index. Enter the correct index name.
const index = client.initIndex('video_info');


// initialize the stream service which can read and write the given ".json" file.
const stream = fs.createReadStream('EmployeeData.json').pipe(StreamArray.withParser());




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