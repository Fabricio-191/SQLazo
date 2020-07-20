function SQLType(thing){
    switch (typeof thing){
        case 'boolean':{ return 'INTEGER' }
        case 'number':{
            if(Number.isInteger(thing)){
                return 'INTEGER'
            }else return 'REAL';
        }
        case 'string':{ return 'TEXT' }

        default:{ return 'BLOB' }
    }
}

const    
BETTER_SQLITE3_DB = require('better-sqlite3'),
     EventEmitter = require('events'),
   DatabaseTables = require('./Structures/Tables.js'),
    DatabaseViews = require('./Structures/Views.js'),
        runPragma = require('./Utils/Pragma.js');

const fn = (things, type) => things.filter(data => data.type === type)

class Database extends EventEmitter{
    constructor(path, options = {}){
        super();
        this.db = new BETTER_SQLITE3_DB(path, options);

        Object.assign(this.db, {
            run: (SQL) => this.db.prepare(SQL).run(),
            all: (SQL) => this.db.prepare(SQL).all(),
            get: (SQL) => this.db.prepare(SQL).get(),
        })
        
        Object.getOwnPropertyNames(this).map(prop => {
            Object.defineProperty(this, prop, { enumerable: false })
        })

        const things = this.db.all('SELECT * FROM sqlite_master');

        if(options.advanced){
            Object.assign(this, {
                runPragma: runPragma.bind(this.db),
                views: new DatabaseViews(this, fn(things, 'view')),
                tables: new DatabaseTables(this, fn(things, 'table'))
            })
        }else{
            Object.assign(this, 
                new DatabaseTables(this, fn(things, 'table'))
            )
        }
    }
}

module.exports = Database;

const db = new Database('./database.db', { advanced: true })

console.log(
    db
)
/*
    require('util').inspect(
        db, { showHidden: true, colors: true }
    )

db.table('tabla').insert()
db.tabla.columns.add()
db.tabla.rename()
db.tabla.delete()


NormalSQLite3 database:

Database {
    table: [
        { column: value },
        { column: value }
    ]
}

console.log(
    require('util').inspect(
        db.tabla, 
        { showHidden: true, colors: true }
    )
)
*/