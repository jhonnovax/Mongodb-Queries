// $Project Command
// The $project stage in MongoDB's Aggregation Framework is used to shape the output of a query 
// by including, excluding, or transforming fields in the documents that pass through the pipeline. 
// It allows you to control which fields are returned, rename fields, or compute new fields based on existing ones.

//In users collection find:
//Count of users by year with status "A" using project 
//Count of documents by year but first see the result of $project
db.users.find({})

db.users.aggregate([
  {
    $project:
    {
      _id: 0,
      age: 1,
      double_age: { $multiply: ["$age", 2] },
    }
  }
])

db.users.aggregate([
  {
    $project:
    {
      _id: 0,
      age: 1,
      double_age: { $divide: ["$age", 2] },
    }
  }
])

db.users.aggregate([
  {
    $project:
    {
      _id: 0,
      year: { $substr: ["$join_date", 0, 4] },
      month: { $substr: ["$join_date", 5, 2] },
      province: "$address.province",
      status: 1,
      age: 1
    }
  }
])

//now the full query
db.users.aggregate([
  {
    $project:
    {
      _id: 0,
      year: { $substr: ["$join_date", 0, 4] },
      month: { $substr: ["$join_date", 5, 2] },
      province: "$address.province",
      status: 1,
      age: 1
    }
  },
  { $match: { "status": "A" } },
  {
    $group: {
      _id:
        { "Year": "$year" }, count: { $sum: 1 }
    }
  },
  { $sort: { "count": -1 } }
])

//Avg Age by year for Status A
db.users.aggregate([
  {
    $project:
    {
      _id: 0,
      year: { $substr: ["$join_date", 0, 4] },
      status: 1,
      age: 1
    }
  },
  { $match: { status: "A" } },
  {
    $group: {
      _id:
        { "Year": "$year" }, avg_age: { $avg: "$age" }
    }
  },
  { $sort: { "avg_age": -1 } }
])


//Convert age to age range 
//using nested ifs (not the complete code, done only until age 20-40)
db.users.aggregate([
  {
    $project:
    {
      _id: 0,
      year: { $substr: ["$join_date", 0, 4] },
      province: "$address.province",
      status: 1,
      age: 1,
      age_range: {
        $cond: {
          if: { $lte: ["$age", 20] }, then: "0-20", else:
            { $cond: { if: { $lte: ["$age", 40] }, then: "20-40", else: "40+" } }
        }
      }
    }
  }
])

// using the switch (complete code)
db.users.aggregate([
  {
    $project:
    {
      _id: 0,
      year: { $substr: ["$join_date", 0, 4] },
      province: "$address.province",
      status: 1,
      age: 1,
      age_range: {
        $switch: {
          branches: [
            { case: { $lte: ["$age", 20] }, then: "0-20" },
            { case: { $lte: ["$age", 40] }, then: "21-40" },
            { case: { $lte: ["$age", 60] }, then: "41-60" },
          ],
          default: "60+"
        }
      }
    }
  }
])


//Avg number of wins by games.code
db.games.aggregate([
  { $unwind: "$games" },
  { $group: { "_id": { "Code": "$games.code" }, avg_wins: { $avg: "$games.wins" } } },
])

//Modify the above to calculate best win ratio (win/total) by games.code
db.games.aggregate([
  { $unwind: "$games" },
  { $group: { "_id": { "Code": "$games.code" }, win_ratio: { $avg: { $multiply: [{ $divide: ["$games.wins", "$games.total"] }, 100] } } } },
  { $sort: { "win_ratio": -1 } }
])

//Find the avg loss/ratio by games code for users with active status and who logged in in the years 2014 or 2016
db.games.aggregate([
  { $unwind: "$games" },
  { $match: { "status": "active", "last_login_date": { $in: [/^2014/, /^2016/] } } },
  { $group: { "_id": { "Code": "$games.code" }, loss_ratio: { $avg: { $multiply: [{ $divide: ["$games.losses", "$games.total"] }, 100] } } } },
  { $sort: { "loss_ratio": 1 } }
])


// In Sales collection find total(sum) of product_total by year(join_date) by province
db.sales.aggregate([
  {
    $project: {
      _id: 0,
      year: { $substr: ["$join_date", 0, 4] },
      province: "$address.province",
      sales_total: "$sales.product_total"
    }
  },
  { $group: { "_id": { "Year": "$year", "Province": "$province" }, total_sales: { $sum: "$sales_total" } } },
  { $sort: { "_id.Year": -1, "_id.Province": 1 } }
])




/////////////////////////////////
///// MAP REDUCE    ////////////
////////////////////////////////
// MapReduce is a data processing model in MongoDB used to process large amounts of data by 
// splitting it into smaller chunks, performing computations on these chunks (map phase), and then 
// aggregating the results (reduce phase). It is a powerful, flexible, but older method often replaced 
// by the Aggregation Framework for most use cases.

//convert this to map reduce
db.sales.aggregate([
  { $match: { "address.province": { $exists: true } } },
  { $group: { "_id": { "Province": "$address.province" }, total_sales: { $sum: "$sales.product_total" } } },
  { $sort: { "total_sales": -1 } }
])

db.collection.mapReduce(
  mapFunction,     // The mapping function (Processes each document in the collection and emits key-value pairs)
  reduceFunction,  // The reducing function (Combines the emitted values for each unique key into a single output)
  {
      out: {},     // Specify where to store results
      query: {},   // Optional filter to select documents
      sort: {},    // Optional sort order
      limit: {}    // Optional limit on input documents
  }
)

//map redue version 
db.sales.mapReduce(
  function () { emit(this.address.province, this.sales.product_total); },
  function (key, value) { return Array.sum(value); },
  {
    query: { "address.province": { $exists: true } },
    out: { inline: 1 }
  }
)


//Avg sales by product category using map reduce
db.sales.mapReduce(
  function () { emit(this.sales.product_category, this.sales.product_total); },
  function (key, value) { return Array.avg(value); },
  {
    query: { "sales": { $exists: true } },
    out: { 
      //"inline": Return results directly.
      //"collection_name": Save results in a new or existing collection.
      inline: 1 
    }
  }
)

