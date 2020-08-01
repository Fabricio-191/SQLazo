function SQLType(thing){
    switch (typeof(thing)){
        case "string":{
            return "TEXT";
        }
        case "boolean":{
            return "INTEGER";
        }
        case "number":{
            if(Number.isInteger(thing)){
                return "INTEGER";
            }else{
                return "REAL";
            }
        }
        default:{
            return "BLOB";
        }
    }
}

function searchErrors(f, thing1, thing2, thing3){
    switch (f){
        case "Database":{
            try{
                require.resolve("sqlite3")
            }catch(e){
                return new Error("SQLite3 package must be installed")
            }

            //thing1 = path
            if(!thing1 || thing1 == "" || thing1.length === 0){
                return new Error("The path where the database is created cannot be empty")
            }else if(typeof(thing1) !== "string"){
                return new Error("The path to the database has to be a string")
            }
            break;
        }

        case "table":{
            //thing2 = table name
            //thing2 = Database
            if(!thing1) return new Error("You did not put a value on 'name'")
            if(typeof(thing1) !== "string") return new Error("The table name has to be a string")

            if(!thing2){
                return new Error("You didn't put a value on 'db'")
            }else if(!thing2.sqlite3db){
                return new Error("You have to place an sqlite3_simple database in the parameter 'db'")
            }
            break;
        }

        case "moveData":{
            //thing1 = table
            //thing1 = data
            if(!thing1) return new Error("You did not put a value on 'old_table'")
            if(!thing2) return new Error("You did not put a value on 'new_table'")
            if(typeof(thing1) !== "string" || typeof(thing2) !== "string") return new Error("The table name has to be a string")
        }

        default:{
            //thing1 = table
            if(!thing1) return new Error("You did not put a value on 'table'")
            if(typeof(thing1) !== "string") return new Error("The table name has to be a string")
        
            if(f === "createTable"){

                if(!thing2) return new Error("You did not put a value on 'sample'")
                if(typeof(thing2) !== "object") return new Error("The sample entered must be an object")

            }else if(f === "insertData" || f === "updateData" || f === "insert0rUpdateData"){

                if(!thing2) return new Error("You did not put a value on 'data'")
                if(typeof(thing2) !== "object") return new Error("The 'data' must be an object or array")

            }else if(f === "getData" || f === "updateData" || f === "insert0rUpdateData" || f === "deleteData"){

                if(!thing3) return new Error("You did not put a value on 'condition'")
                if(typeof(thing3) !== "object" && typeof(thing3) !== "boolean"){
                    return new Error("The condition entered must be an object or a boolean")
                }

            }
        }
    }
    return false
}

class Table {
        /**
         * @param {string} table_name The name of the table  
         * The table has to be created, this does not create it
         * 
         * @param {SQLite3_Simple-Database} database Has to be a `Database` class
         */
    constructor(table_name, database){
        let e = searchErrors("table", table_name, database,);
        if(e) return new Promise((resolve, reject) => reject(e));

        this.table = table_name;
        this.db = database;
    };

        /**
         * @param {object|array} data The data to save, for example: `{id: "123215123", monedas: 7000}` or an array with objects like that
         * @returns {promise} Returns a promise
         */
    insertData(data){
        return this.db.insertData(this.table, data);
    };

        /**
         * @param {object|boolean} condition It will tell the program what to look for in the database, for example: `{money: 6020}`  
         * (all de data where the id = "123215123")
         * 
         * If the condition is `true` it returns all the data in the table
         * @returns {promise} Returns a promise, and then when it resolves, an array like this:
         * ```js 
         * [ { id: '123215123', money: 6020 }, { id: '484321883', money: 6020 } ]
         * ```
         */
    getData(condition){
        return this.db.getData(this.table, condition);
    };

        /**
         * @param {object|boolean} condition It will tell the program what to look for in the database, for example: `{money: 6020}`.
         * It will erase all data that meets that condition
         * 
         * If the condition is `true` it will delete all the data in the table
         * @returns {promise} Returns a promise
         */
    deleteData(condition){
        return this.db.deleteData(this.table, condition);
    };

        /**
         * @param {object|boolean} condition It will tell the program what to look for in the database, for example: `{id: "123215123"}`.
         * It will edit all data that meets that condition
         * 
         * If the condition is `true` it will edit all the data in the table
         * @param {object} data The new data
         * @returns {promise} Returns a promise
         */
    updateData(condition, data){
        return this.db.updateData(this.table, condition, data);
    };

        /**
         * @param {object|boolean} condition It will tell the program what to look for in the database, for example: `{id: "123215123"}`.
         * If it founds some that meets that condition, it will update it, else it will insert the data
         * 
         * If the condition is `true` it will edit all the data in the table (if the condition is true, it always edit all the data on the table)
         * @param {object} data The data to save or the new data in all the data that meets the condition
         * @returns {promise} Returns a promise, and then a boolean, `true` if it update or `false` if it insert
         */
    insert0rUpdateData(condition, data){
        return this.db.insert0rUpdateData(this.table, condition, data);
    };

        /**
         * @returns {promise} Returns a promise 
         */
    delete(){
        return this.db.deleteTable(this.table);
    };
}
class Database {
        /**
         * @param {string} path The path where the database is, and if it does not exist, it will be created
         */
    constructor(path){
        let e = searchErrors("Database", path);
        if(e) return new Promise((resolve, reject) => reject(e));

        const sqlite3 = require('sqlite3').verbose();

        if(!path.endsWith(".db")) path += ".db"
        this.sqlite3db = new sqlite3.Database(path);
    };

    //tables

        /**
         * @param {string} table_name The name of the table to create
         * @param {object} sample Sample data, ej:
         * ```js
         * {id: "123215123", money: 7000}
         * ```
         * These data will not store in the database, it is only to create the structure of de database
         * @returns {promise} Returns a promise
         */
    createTable(table_name, sample) {
        var e = searchErrors("createTable", table_name, sample)
        if(e) return new Promise((resolve, reject) => reject(e));

        var Table_Class = new Table(table_name, this)

        var SQL = Object.entries(sample)
            .map(c => {
                return c[0]+' '+SQLType(c[1]) 
            }).join(', ');

        return new Promise((resolve, reject) => {
            this.sqlite3db.run(`CREATE TABLE IF NOT EXISTS ${table_name} (${SQL})`, function(err) {
                if (err) reject(err.message);
                resolve(Table_Class);
            })
        })
        
    }

        /**
         * @param {string} nombre_tabla The name of the table to delete
         * @returns {promise} Returns a promise
         */
    deleteTable(table_name){
        var e = searchErrors("deleteTable", table_name)
        if(e) return new Promise((resolve, reject) => reject(e));

        return new Promise((resolve, reject) => {
            this.sqlite3db.run(`DROP TABLE IF EXISTS ${table_name}`, function(err) {
                if (err) reject(err.message);
                resolve();
            })    
        })
    }

        /**
         * @returns {promise} Returns a promise, and then an array with all the "Tables" in the Database
         */
    getTables(){
        return new Promise((resolve, reject) => {
            this.sqlite3db.all("SELECT * FROM sqlite_master WHERE type = 'table'", async (err, tablesSQL) => {
                if(err) reject(err)
                var tables = tablesSQL.map(async t => {
                    return new Table(t.name, this)
                })
                Promise.all(tables).then(resolve).catch(reject)
            })
        })
    }

        /**
         * @param {string} oldTable The name of the old table
         * @param {string} newTable The name of the new table
         *
         * @returns {promise} Returns a promise
         */
    moveData(oldTable, newTable){
        var e = searchErrors("moveData", oldTable, newTable);
        if(e) return new Promise((resolve, reject) => reject(e));

        return new Promise((resolve, reject) => {
            this.obtenerDatos(oldTable, true).then(data => {
                if(data === false) reject(new Error("The old table hasn't data")) 
                this.insertarDatos(newTable, data).then(() => {
                    resolve()
                }).catch(reject)
            }).catch(reject)
        })
    }

    //data

        /**
         * @param {string} table_name The name of the table to insert the data
         * @param {object|array} data The data to save, for example: `{id: "123215123", monedas: 7000}` or an array with objects like that
         * @returns {promise} Returns a promise
         */
    insertData(table_name, data){
        var e = searchErrors("insertData", table_name, data)
        if(e) return new Promise((resolve, reject) => reject(e));

        if(Array.isArray(data)){
            return new Promise((resolve, reject) => {
                data = data.map(dato => {

                    var SQL_columns = Object.entries(dato)
                        .map(c => c[0])
                        .join(', ')

                    var SQL_values = Object.entries(dato)
                        .map(c =>  
                            typeof(c[1]) == "string"?
                            `'${c[1]}'`
                            :`${c[1]}`
                        )
                        .join(', ')
                        
                    return new Promise((resolve, reject) => {
                        this.sqlite3db.run(`INSERT INTO ${table_name}(${SQL_columns}) VALUES(${SQL_values})`, function(err) {
                            if (err) reject(err)
                            resolve()
                        })
                    })

                })

                Promise.all(data).then(() => resolve()).catch(reject)
            })
        }else{
            var columnas = Object.entries(data)
                .map(c => c[0])
                .join(', ')

            var valores = Object.entries(data)
                .map(c =>  
                    typeof(c[1]) == "string"?`'${c[1]}'`:`${c[1]}`
                )
                .join(', ')
            
            return new Promise((resolve, reject) => {
                this.sqlite3db.run(`INSERT INTO ${table_name}(${columnas}) VALUES(${valores})`, function(err) {
                    if (err) reject(err.message)
                    resolve()
                })
            })
        }

    }

        /**
         * @param {string} table_name The name of the table to get the data
         * @param {object|boolean} condition It will tell the program what to look for in the database, for example: `{money: 6020}`  
         * (all de data where the id = "123215123")
         * 
         * If the condition is `true` it returns all the data in the table
         * @returns {promise} Returns a promise, and then when it resolves, an array like this:
         * ```js 
         * [ { id: '123215123', money: 6020 }, { id: '484321883', money: 6020 } ]
         * ```
         */
    getData(table_name, condition){
        var e = searchErrors("getData", table_name, null, condition)
        if(e) return new Promise((resolve, reject) => reject(e));

        if(condition === true){
            return new Promise((resolve, reject) => {
                this.sqlite3db.all(`SELECT * FROM ${table_name}`, (err, filas) => {
                    if (err) reject(err.message);
                    if(!filas || filas == undefined || filas.length == 0) resolve(false);
                    resolve(filas);
                })
            })
        }

        var SQL_condition = Object.entries(condition)
            .map(c => (typeof(c[1]) == "string")?`${c[0]} = '${c[1]}'`:`${c[0]} = ${c[1]}`)
            .join(" AND ")

        return new Promise((resolve, reject) => {
            this.sqlite3db.all(`SELECT * FROM ${table_name} WHERE ${SQL_condition}`, (err, filas) => {
                if (err) reject(err.message);
                if(!filas || filas == undefined || filas.length == 0) resolve(false);

                resolve(filas);
            })
        })
    }

        /**
         * @param {string} table_name The name of the table to get the data
         * @param {object|boolean} condition It will tell the program what to look for in the database, for example: `{money: 6020}`.
         * It will erase all data that meets that condition
         * 
         * If the condition is `true` it will delete all the data in the table
         * @returns {promise} Returns a promise
         */
    deleteData(table_name, condition){
        var e = searchErrors("deleteData", table_name, null, condition);
        if(e) return new Promise((resolve, reject) => reject(e));

        if(condition === true){
            return new Promise((resolve, reject) => {
                this.sqlite3db.all(`DELETE FROM ${table_name}`, (err) => {
                    if (err) reject(err);
                    resolve();
                });
            });
        }

        var SQL_condition = Object.entries(condition)
            .map(c => (typeof(c[1]) == "string")?`${c[0]} = '${c[1]}'`:`${c[0]} = ${c[1]}`)
            .join(" AND ");

        return new Promise((resolve, reject) => {
            this.sqlite3db.all(`DELETE FROM ${table_name} WHERE ${SQL_condition}`, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

        /**
         * @param {string} table_name The name of the table
         * @param {object|boolean} condition It will tell the program what to look for in the database, for example: `{id: "123215123"}`.
         * It will edit all data that meets that condition
         * 
         * If the condition is `true` it will edit all the data in the table
         * @param {object} data The new data
         * @returns {promise} Returns a promise
         */
    updateData(table_name, condition, data){
        var e = searchErrors("updateData", table_name, data, condition)
        if(e) return new Promise((resolve, reject) => reject(e));
        
        var SQL_data = Object.entries(data)
            .map(c => (typeof(c[1]) == "string")?`${c[0]} = '${c[1]}'`:`${c[0]} = ${c[1]}`)
            .join(', ')
            
        if(condition === true){
            return new Promise((resolve, reject) => {
                this.sqlite3db.run(`UPDATE ${table_name} SET ${SQL_data}`, function(err) {
                    if (err) reject(err);
                    resolve();
                })
            })
        }
      
        var SQL_condition = Object.entries(condition)
            .map(c => (typeof(c[1]) == "string")?`${c[0]} = '${c[1]}'`:`${c[0]} = ${c[1]}`)
            .join(" AND ")
        
        return new Promise((resolve, reject) => {
            this.sqlite3db.run(`UPDATE ${table_name} SET ${SQL_data} WHERE ${SQL_condition}`, function(err) {
                if (err) reject(err);
                resolve();
            })
        })
    }

        /**
         * @param {string} table_name The name of the table
         * @param {object|boolean} condition It will tell the program what to look for in the database, for example: `{id: "123215123"}`.
         * If it founds some that meets that condition, it will update it, else it will insert the data
         * 
         * If the condition is `true` it will edit all the data in the table (if the condition is true, it always edit all the data on the table)
         * @param {object} data The data to save or the new data in all the data that meets the condition
         * @returns {promise} Returns a promise, and then a boolean, `true` if it update or `false` if it insert
         */
    insert0rUpdateData(table_name, condition, data){
        var e = searchErrors("insert0rUpdateData", table_name, data, condition);
        if(e) return new Promise((resolve, reject) => reject(e));

        return new Promise((resolve, reject) => {
            this.getData(table_name, condition).then(async d => {
                if(d){
                    this.updateData(table_name, condition, data)
                        .then(() => resolve(true))
                        .catch(reject);
                }else{
                    this.insertData(table_name, data)
                        .then(() => resolve(false))
                        .catch(reject);
                };
            }).catch(reject);
        });
    }

}

module.exports = { 
    Database, Table
}
