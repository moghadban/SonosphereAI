const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'sonosphere';

MongoClient.connect(url, function(err, client) {
if (err) {
console.log(err);
} else {
console.log('Connected to MongoDB');

const db = client.db(dbName);

// Create collections
db.createCollection('notes', function(err, res) {
if (err) {
console.log(err);
} else {
console.log('Notes collection created');
}
});

db.createCollection('instruments', function(err, res) {
if (err) {
console.log(err);
} else {
console.log('Instruments collection created');
}
});

db.createCollection('vocals', function(err, res) {
if (err) {
console.log(err);
} else {
console.log('Vocals collection created');
}
});

db.createCollection('noise_reductions', function(err, res) {
if (err) {
console.log(err);
} else {
console.log('Noise reductions collection created');
}
});

// Close client
client.close();
}
});