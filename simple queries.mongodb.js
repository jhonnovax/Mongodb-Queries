// All data
db.getCollection('users').find({})

// Single value
db.getCollection('users').find({
    "status": "A"
}).count()

// Arrays
db.getCollection('users').find({
    colours: "Red"
}).count()

// Sub documents
db.getCollection('users').find({
    "address.province": "BC"
})

// Selecting data
db.getCollection('users').find({
    "address.province": "BC"
}, {
    _id: 0, // Primary key
    status: 1
})

db.getCollection('users').find({
    "address.province": "BC"
}, {
    _id: 0, 
    status: 0
})

// Comparison operators
db.getCollection('users').find({
    "status": { $ne: "A" } // Not equal
})


/**********
 * Test
 *********/

// Count of users age less than 20
db.users.find({
    "age": { $lt: 20 }
}).count()

// Users with no addresses
db.users.find({
    "address": { $exists: false }
})

// Users with at least one color from red or blue
db.users.find({
    "colours": { $in: ["Red", "Blue"] }
})

// Regular expression
db.users.find({
    "join_date": /^2013/
})

// Simple and
db.users.find({
    "age": { $gt: 25, $lt: 40 },
    "address.province": "BC"
})

db.users.find({
    "colours": { $in: ["Goldenrod"] },
    $and: [
        { "join_date": { $gte: "2013-01-01" } },
        { "join_date": { $lte: "2013-12-31" } }
    ]  
})

// How many users in BC And have colours [Red or pink] or joined in 2012
db.users.find({
    $and: [
        { "address.province": "BC" },
    ],
    $or: [
        { "colours": { $in: ["Red", "Pink"] } },
        { "join_date": { $gte: "2012-01-01", $lte: "2012-12-31" } }
    ]
}).count()

// how many users have .edu emails and are in provinces BC, AB, ON
db.users.find({
    $and: [
        { "email": /.edu/ },
        { "address.province": { $in: ["BC", "AB", "ON"] } },
    ]
}).count()