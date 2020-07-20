# Information
This package is used to make a database in sqlite3 much easier

If you know sqlite3 and you want to simplify some functions this package also works, below it is explained how to directly access the sqlite3 database

# Change Log

Version: 2.0.0

* [The package was redone](https://www.npmjs.com/package/sqlite3-simple), (yes, again)

* A lot of methods, properties and structures where added/modified

Note: the other versions of the package where unpublished 

Version: 1.0.0

* [The package was redone](https://www.npmjs.com/package/sqlite3-simple), with [better-sqlite3](https://www.npmjs.com/package/better-sqlite3) instead of [sqlite3](https://www.npmjs.com/package/sqlite3) 

* The package name is now SQLazo instead of simple-sqlite3

* Is now completely synchronous

* Now it is much more efficient and faster, thanks to [better-sqlite3](https://www.npmjs.com/package/better-sqlite3)

Version: 0.6.0

* Added the `Table` class with its 6 functions

* Now the function `createTable()` will return an `Table` class

* New functions `moveData()` and `getTables()`

* The system was modified to handle errors more efficiently

* The function `insertData()` now the data entered can be an array

* Now it is imported differently

* The package was translated into English (with google translator)

Version: 0.4.0

* Changelog added

* New function `existsTable()`

* Now the conditions can be more than one

* Fixed some errors

* More examples were added

* New way of handling errors

## Example of use
``` js
const { Database, Table } = require ("SQLazo");
const db = new Database("./Base.db");

/*
A file will be created next to the one containing this line, creating the file "base.db"
You can put the route you want, like "../folder1/dbs/base.db". Always with the ending ".db"
*/

var table = db.createTable("economy", {id: "123215123", coins: 7000})

var data = table.getData({id: "123215123"});
    
if(data.length !== 0){
	console.log(data);
	if (data[0].coins < 10000) {
    	table.updateData({id: "123215123"}, {id: "123215123", coins: data[0].coins + 500});
	}else{
    	console.log (`${data[0].id} reached 10,000 coins`);
    }
}else{
	table.insertData({id: "123215123", coins: 7000});
}
```
Below are more examples of use

# Classes 

- Database(path)

     `Path:` is the path to the file with the db, example: `../folder1/dbs/base.db`

- Table(name, Database)

     `Name:` is the name of the table

     `Database:` has to be a `Database` class

     `Notes:` the table has to be created, this does not create it

# Functions

All functions, except some that are indicated, return `true` if everything went well and` false` if there was an error

- Functions of the `Database` class

    - createTable(tableName, sample)  
        `Returns:` returns `false` if there was an error and if not, returns a `Table` class

    - deleteTable(tableName)  
    
    - getTables()  
        `Returns:` returns `false` if there was an error and if not, returns an array with all the `Table` in the database

    - moveData(oldTable, newTable)  
        `Notes:` used to move data between tables, but the columns have to have the same names (in the case of `{id:" 123215123 ", coins: 7000}` the columns are `id` and` coins`), and the new column/s will remain with value `null`

        Definitions
        
        `table:` would be the name of the table, for example: `"economy"` (oldTable and newTable are also a table)

        `sample:` an object with the data of "sample", for example `{id:" 123215123 ", coins: 7000}`
    
        This is due to the structure of the sqlite databases, this "sample" serves to define that structure once the table is created, because then you cannot insert a number where you put a string.
    
        If you try to insert `{id: 123215123, coins: true}` after creating the table with the sample `{id: "123215123", coins: 7000}` the id pass it to string and that `true` convert it to a 1 as if they had inserted `{id: "123215123", coins: 1}`

    - insertData(table, data)  

    - getData(table, condition)  
        `Returns:` returns `false` if there was an error and if not, returns an array like this:
        ```js 
        [{id: '123215123', money: 6020}, {id: '484321883', money: 6020}]
        ```

    - updateData(table, condition, data) 

    - insert0UpdateData(table, condition, data)  
        `Notes:` if the data already exists (they comply with the `condition`) it updates it by the new ones, and if they do not exist, it inserts them.

    - deleteData(table, condition)  

        Definitions
        
        `table:` name of the table on which it will work
        
        `data:` an object or array with the data to be put, for example `{id:" 123215123 ", coins: 7000}` or `[{id: "123215123", coins: 7000}, {id:" 113476821 " , coins: 8000}]` the array can only be used when data is inserted, not when updating
        
        `condition:` an object (or boolean) that tells the program what to search the database, for example: `{id: "123215123"}`. It will be searched in the
        database all "rows" where this "condition" is met, that the id is       "123215123". Another example: `{id: "123215123", coins: 7000}` The condition would be for the id to be "123215123" and it have 7000 coins
        
        `Notes:` if you set the `condition` as `true`: `getData(table, true)` in any of the functions with `condition` it will delete/obtain/edit, all data in the table (except the `getData()` function)
        (the `insert0UpdateData` function will only do it when it is updating)

- Functions of the `Table` class
    
    - insertData(data)

    - getData(condition)  
        `Returns:` returns `false` if there was an error and if not, returns an array like this:
        ```js 
        [{id: '123215123', money: 6020}, {id: '484321883', money: 6020}]
        ```

    - updateData(condition, data) 

    - insert0UpdateData (condition, data)  
        `false` if it insert and` true` if it update

        `Notes:` if the data already exists (they comply with the `condition`) it updates them by the new ones, and if they do not exist, it inserts them

    - deleteData(condition)  

    - delete()

        ### Definitions

        `data:` an object or array with the data to be put, for example `{id:" 123215123 ", coins: 7000}` or `[{id: "123215123", coins: 7000}, {id:" 113476821 " , coins: 8000}]` the array can only be used when data is inserted, not when updating
        
        `condition:` an object (or boolean) that tells the program what to search the database, for example: `{id: "123215123"}`. It will be searched in the database all "rows" where this "condition" is met, that the id is "123215123". Another example: `{id: "123215123", coins: 7000}` The condition would be for the id to be "123215123" and it have 7000 coins
        
        `Notes:` if you set the `condition` as `true`: `getData(table, true)` in any of the functions with `condition` it will delete/obtain/edit, all data in the table (except the `getData()` function)
        (the `insert0UpdateData` function will only do it when it is updating)
        
# Other examples of use

Here is an example of cooldown quite useful, to an api, for example

```js
const { Database } = require("SQLazo");
const db = new Database("./Base.db");

db.createTable("cooldown", { ip: "string", ends: (Date.now() + 10000) });

function hasCooldown(ipObject) {
    var data = db.getData("cooldown", ipObject);
    if(data.length !== 0){
        if(data[0].ends > Date.now()){
            return true; //has cooldown
        }else{
			db.deleteData("cooldown", {ip: ipObject.ip})
            return false; //doesn't have cooldown
        }
    }else{
        return false; //doesn't have cooldown
    }
}


var ipsSamples = [
    {ip: "176.178.197.128"},
    {ip: "204.8.234.130"},
    {ip: "120.99.71.11"}
];

var index = 0;
setInterval(async () => {
    if(hasCooldown(ipsSamples[index])){
		console.log(`1 ${ipsSamples[index].ip} has cooldown`);
		
    }else{
        console.log(`2 ${ipsSamples[index].ip} hasn't cooldown`);

        db.insertData("cooldown", {ip: ipsSamples[index].ip, ends: (Date.now() + 10000)})

        console.log(`3 now ${ipsSamples[index].ip} has cooldown`);
            
        setTimeout(() => {
            db.deleteData("cooldown", {ip: ipsSamples[index].ip});
        }, Math.random() * 15000);

    }
    

    (index === (ipsSamples.length - 1))?index = 0:index++;
}, Math.random() * 5000)
```

Another example:

```js
const { Database, Table } = require("SQLazo");
const db = new Database("./Base.db");

console.log(db.getTables());
    
db.createTable("economy", {id: "some string", coins: 1});

console.log(db.getTables());

var table = new Table("economy", db);

var array = [
    {id: "12325123", coins: 7000}, 
    {id: "14788436", coins: 7000}, 
	{id: "75183149", coins: 7000}
]

array.map(info => {
	table.insertData(info);
})
console.log(table.getData(true))

table.delete();

console.log(db.getTables());
```
And here something for those who already know sqlite3 or for some other reason, if you want to directly access the db of sqlite use `db.db`  
Here is an example:
```js
const { Database } = require("SQLazo");
const db = new Database("./Base.db");

console.log(db.db.prepare(`SELECT * FROM economy`).all());
```
