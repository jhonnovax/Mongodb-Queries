/* 
	Q1: [SQL]Select status, avg(age) as AvgAge
		from users
		group by status
 */
db.users.aggregate([
	{ $match: { "status": { $exists: true } } },
	{ $group: { _id: "$status", AvgAge: { $avg: "$age" } } },
	{ $sort: { "_id.status": 1 } }
])
	

/* better version(with label for group by field status) */
db.users.aggregate([
	{ $match: { "status": { $exists: true } } },

	{ $group: { _id: { "status": "$status" }, AvgAge: { $avg: "$age" } } },

	{ $sort: { "_id.status": 1 } }
])



/* 
	Q2: [SQL] Select province, count(province) as count
	from users
	group by province
	order by count desc 
*/
db.users.aggregate([
	{ $match: { "address.province": { $exists: true } } },

	{ $group: { _id: { "Province": "$address.province" }, ProvCount: { $sum: 1 } } },

	{ $sort: { "ProvCount": -1, "_id.Province": 1 } }
])


/* Q2b: [SQL] Select province, city, count(province) as count
	from users
	group by province, city
	order by province, city */
db.users.aggregate([
	{ $match: { "address.province": { $exists: true } } },

	{
		$group:
		{
			_id: { "Province": "$address.province", "City": "$address.city" },
			count: { $sum: 1 }
		}
	},

	{ $sort: { "_id.Province": 1, "_id.City": 1 } }
])

/* Q: Group sales by province in the western provinces, sort by sales amount descending
BC, AB, SK, MB */
db.sales.aggregate([
	{ $match: { "address.province": { $in: ["BC", "AB", "SK", "MB"] } } },
	{
		$group: {
			_id:
				{ "Province": "$address.province" }, total_sales: { $sum: "$sales.product_total" }
		}
	},
	{ $sort: { "total_sales": -1 } }
])



/* Q: Overall average of product_qty for the entire collection */
db.sales.aggregate([
	{ $group: { _id: null, avg_qty: { $avg: "$sales.product_qty" } } }
])


/* Q.cust_sup collection find the avg days by department for tickets in year 2014 */
db.cust_sup.aggregate([
	{ $match: { "date": /^2014/ } },

	{ $group: { _id: { "department": "$department" }, "avg_days": { $avg: "$estimation.days" } } },

	{ $sort: { "avg_days": -1, } }
])


/* Q: from users collection, find avg age of users who joined in year 2012 */
db.users.aggregate([
	{ $match: { "join_date": /^2012/ } },
	{ $group: { _id: null, avg_age: { $avg: "$age" } } }
])


/* Q.Avg number of wins by games.code */
db.games.aggregate([
	{ $unwind: "$games" },
	{ $group: { "_id": { "Code": "$games.code" }, avg_wins: { $avg: "$games.wins" } } },
])


// In students collection find the average grade (grade) by enrollment_sem. 
db.students.find({})

//Check unwind first..
db.students.aggregate([
	{ $unwind: "$terms" },
	{ $unwind: "$terms.courses" }
])

//full query
db.students.aggregate([
	{ $unwind: "$terms" },
	{ $unwind: "$terms.courses" },
	{ $group: { "_id": "$enrollment_sem", avgGrade: { $avg: "$terms.courses.grade" } } },
	{ $sort: { "avgGrade": -1 } }
])




