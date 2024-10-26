
// You can use this template to build your queires
// replace anything within angle brackes (<>) including the angle brackets with real values. 
// e.g. db.<collectionName>.find will become db.users.find for user collection query
// <x|y> means use either x or y e.g. <1 | -1>1  means use 1 or -1 without the <>
// not all the parameters are required, omit the ones not needed


/*
db.<collectionName>.aggregate([
{$unwind: "$<arrayOfSubdocumentsTobeUnwindForAggregation>"},
{$match: {<AnyfilterCriteria>}},
{$group: {"_id": {"<DisplayNameOfGroupBy>": "$<GroupByField>"}, <DisplayNameOfAgreegatedValue>: {<$avg|$sum>: <"$fieldToBeAgreegated" | 1 >}}},
{$sort: {<filed>: <1 | -1>}}
])

*/

//Now you can create any query by yourself and try it out e.g. 
// in game collection find the avg of wins by game code for people from BC
// so it will translate to 

db.games.aggregate([
	{
		$unwind: "$games"
	},
	{
		$match: {
			"address.province": "BC"
		}
	},
	{
		$group: {
			"_id": { "GameCode": "$games.code" }, 
			avgWin: {$avg: "$games.wins"}
		}
	},
	{
		$sort: {
			"_id.GameCode": 1
		}
	}
])

// now try for avg of total by game code for people from BC and age over 35... or any other query you can make by plugging in the values... 