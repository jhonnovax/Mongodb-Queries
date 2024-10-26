/* ######################
# Practise Questions #
######################
 */

/* For the questions below try to solve them using the following structure. (you might not need all the functions) */
/* db.games.aggregate([
	 {$unwind: },
	 {$match: },
	 {$group: },
	 {$sort: }
]) */


/* Q: In users collection find average age of users by status for the users who joined in 2013. */
/* partial outcome*/
/* {
    "_id" : "D",
    "average_age" : 55.9310344827586
}
 */
db.users.aggregate([
	{$match: {join_date: /^2013/}},
	{$group: {_id: "$status", average_age: {$avg: "$age"}}},
    {$sort: {"average_age": -1}}
])

/* Q: In users collection find number of users by status for the users who joined in 2013. */
/* 1 */
/* {
    "_id" : "A",
    "count" : 70.0
}
 */
db.users.aggregate([
	{$match: {join_date: /^2013/}},
	{$group: {_id: "$status", count: {$sum: 1}}},
    {$sort: {"count": -1}}
])

/* Q: Group sales.product_total by address.province */
/* 
{
    "_id" : {
        "Province" : "NT"
    },
    "total_sales" : 44508.06
} */
db.sales.aggregate([
    {$match: { 'address.province': { $exists: true } }},
    {$group: {_id: { Province: "$address.province" }, total_sales: {$sum: "$sales.product_total"}}},
    {$sort: { total_sales: -1 }}
])


/* Q: Get average quantity for overall sales for 2012 */

/* 1 */
/* {
    "_id" : null,
    "avg_qty" : 54.4439024390244
} */

db.sales.aggregate([
    {$match: { 'join_date': /^2012/ }},
    {$group: {_id: null, avg_qty: {$avg: "$sales.product_qty"} }},
    {$sort: { avg_qty: -1 }}
])

/* Q: find avg product_qty by province only in the western provinces (BC, AB, SK, MB) */

/* 1 */
/* {
    "_id" : {
        "Province" : "AB"
    },
    "avg_qty" : 52.0862068965517
}
 */
db.sales.aggregate([
    {$match: { 'address.province': { $in: ["AB"] } }},
    {$group: {_id: { Province: "$address.province" }, avg_qty: {$avg: "$sales.product_qty"} }},
    {$sort: { avg_qty: -1 }}
])

/* Q: In Sales collection, which province buys on average most meat?

Match: meat
group: province
avg: product_qty */


/* 1 */
/* {
    "_id" : {
        "Province" : "NWT"
    },
    "avg_sales" : 71.3846153846154
} */
db.sales.aggregate([
    {$match: { 'address.province': { $exists: true }, 'sales.product_category': "Meat" }},
    {$group: {_id: { Province: "$address.province" }, avg_qty: {$avg: "$sales.product_qty"} }},
    {$sort: { avg_qty: -1 }}
])

/* Q. In cust_sup, Find avg estimation days by department by estimation effort when the cost was > 500
Hint: You can do two group by, in the _id separated by comma  */

/* 1 */
/* {
    "_id" : {
        "Department" : "billing",
        "Effort" : "extreme"
    },
    "avg_days" : 69.0
} */

db.cust_sup.aggregate([
    {$match: { 'estimation.cost': { $gt: 500 } }},
    {$group: {_id: { Department: "$department", Effort: "$estimation.effort" }, avg_days: {$avg: "$estimation.days"} }},
    {$sort: { avg_days: -1 }}
])

/* Q: Find Avg number of wins by games.code
Hint: you have to use $unwind before you can do group.
 */

/* 1 */
/* {
    "_id" : {
        "Code" : "P"
    },
    "avg_wins" : 26.3606557377049
} */

db.games.aggregate([
    {$unwind: "$games"},
    {$match: {}},
    {$group: {_id: { Code: "$games.code" }, avg_wins: {$avg: "$games.wins"} }},
    {$sort: { avg_wins: -1 }}
])



/* Q: Find the avg losses by games code for users with active status and who logged in in the years 2014 or 2016
Hint: you have to use $unwind before you can do group. */
/* 1 */
/* {
    "_id" : {
        "Code" : "P"
    },
    "Avg_Loss" : 27.4444444444444
} */

db.games.find({})

db.games.aggregate([
    {$unwind: "$games"},
    {
        $match: {
            status: "active", 
            /* last_login_date: {$in: [ /^2014/, /^2016/ ]} } , */
            $or: [
                { last_login_date: /^2014/ },
                { last_login_date: /^2016/ }
            ]
        }
    },
    {$group: {_id: { Code: "$games.code" }, Avg_Loss: {$avg: "$games.losses"} }},
    {$sort: { Avg_Loss: -1 }}
])

