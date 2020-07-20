class TableColumns extends Array{
    constructor(columns, toBind){
        super(...columns);

        Object.defineProperties(this, {
            'add':{
                value: this['add'].bind(toBind),
                enumerable: false
            },
            'rename':{
                value: this['rename'].bind(toBind),
                enumerable: false
            }
        })
    }
    static get [Symbol.species]() {
        return Array;
    }

    add(columnName){
        this.db.run(`ALTER TABLE ${this.name} ADD COLUMN ${columnName}`);
        this.statements.insert = null;   
    }

    rename(oldName, newName){
        this.db.run(`ALTER TABLE ${this.name} RENAME COLUMN ${oldName} TO ${newName}`);
    }
}

class Table extends Array{
    constructor(name, { database, sql }){
        const db = database.db;
        super(...db.all(`SELECT * FROM ${name}`))

        const columns = Array.from(db.prepare(`SELECT * FROM ${name}`).columns().map(c => c.name))
        Object.assign(this, { 
            name, db, sql,
            columns: new TableColumns(columns, this), 
            statements: {
                clear: db.prepare(`DELETE FROM ${name}`),
                getAll: db.prepare(`SELECT * FROM ${name}`)
            }
        });

        Object.getOwnPropertyNames(this).map(prop => {
            Object.defineProperty(this, prop, { enumerable: false })
        }) //Make properties invisible
    }
    static get [Symbol.species]() {
        return Array;
    }

    delete(condition, options){


        let SQL = `DELETE FROM ${this.name}`
        if(condition !== true){

        }

        this.db.run(SQL)
    }

    clear(){
        this.statements.clear.run(); this.reload();
    }

    insert(data, options){
        if(!data || typeof data !== 'object'){
            throw new Error('')
        }else if(Object.entries(data).length !== this.columns.length){
            throw new Error()
        }

        if(!this.statements.insert){
            let SQL = this.columns.map(() => '?').join(', ');
            this.statements.insert = this.db.prepare(`INSERT INTO ${this.name} VALUES(${SQL})`)
        } 

        const parsedData = parseData(data, this.columns)

        if(Array.isArray(data)){
            this.statements.insert.run(...data)
        }else{
            this.db.run(`INSERT INTO ${this.name}(${parsedData.columns}) VALUES(${parsedData.values})`)
        }
        super.push(parsedData.raw)
    }

    update(){
        this.db.prepare(`UPDATE ${this.name} SET value = ? WHERE key = ? AND numberKey = ?`)
    }    
    
    select(condition, options){
        const SQL = `SELECT * FROM ${this.name} WHERE ${parseCondition(condition)}`;


        return this.db.prepare(SQL).all()
    }

    reload(){
        super.splice(0, this.length)

        this.db.all(`SELECT * FROM ${this.name}`).map(value => {
            super.push(value)
        })
    }
}

class DatabaseTables{
    constructor(database, tables){
        Object.getOwnPropertyNames(this.tables).map(prop => {
            Object.defineProperty(this.tables, prop, {
                enumerable: false, value: this.tables[prop].bind(database)
            })
        })
        
        tables.map(({name, sql}) => {
            this.tables[name] = new Table(name, { database, sql })
        })
    }

    tables = {
        delete(table){
            table = this[table]
            if(!table){
                throw new Error('')
            }

            var stop = false, doAfter = null;

            this.emit('tableDelete', (
                table, 
                ()   => stop = true, 
                (fn) => doAfter = fn || null
            ))

            if(typeof stop !== 'boolean' || typeof doAfter !== 'function'){
                throw new Error()
            }
            
        
            if(stop) return;

            this.db.run('DROP TABLE IF EXISTS '+table.name); 

            delete this[table.name];
            if(doAfter !== null) doAfter();
        }, 
        
        changeName(oldName, newName){
            this.db.run(`ALTER TABLE ${oldName} RENAME TO ${newName}`);
        },
    
        create(name, columns){
            if(!name || typeof name !== 'string'){
                throw new Error('')
            }else if(!columns || 
              !Array.isArray(columns) || 
              columns.length === 0 || 
              columns.some(column => typeof column !== 'string')){
                throw new Error('')
            }
        
            if(!this[name]){
                try{
                    this.db.run(`CREATE TABLE IF NOT EXISTS ${name}(${columns.join(', ')})`);
    
                    this[name] = new Table(name, { db: this.db, columns });
                }catch(e){ throw e }
            }  
        
            return this[name];
        },
    
        info(table){
            if(!this[table]){
                throw new Error('')
            }
    
            return {
                name: table,
                columns: this[table].columns,
                SQL: this[table].SQL
            }
        }
    }
}

[TableColumns, Table, DatabaseTables].map(obj => {
    Object.defineProperty(obj, 'name', { value: '' })
})

module.exports = DatabaseTables;

function parseData(data, columns){
    if(typeof data !== 'object') throw new Error('')

    if(Array.isArray(data)){
        return parseData(
            Array.from(columns).reduce((acc, column, index) => {
                acc[column] = data[index]; return acc;
            }, {})
        )
    }else{
        let val = Object.values(data).map(c => {
            if(typeof(c) === 'string') return `'${c}'`
            if(typeof(c) === 'boolean'){
                if(c === true) return '1'; else return '0';
            }

            return `${c}`
        })
        return {
            columns: Object.keys(data).join(', '),
            values: val.join(', '),
            arrValues: val,
            raw: data
        }
        
    }
}

const REGEX = [
    [/\|\|/g, ' OR '],
    [/&&/g, ' AND ']
]

/*
||
*    /    %
+    -
<<   >>   &    |
<    <=   >    >=
=    ==   !=   <>   IS   IS NOT   IN   LIKE   GLOB   MATCH   REGEXP
AND   
OR

database.on('tableDelete', (table, abort, doAfter) => {
    if(table.name === 'cosas'){
        abort()
    }else{
        doAfter(() => {
            console.log('table deleted: '+table.name)
        })
    }
})

*/

function parseCondition(condition){
    if(typeof condition === 'string'){
        return REGEX.reduce(
            (acc, [regex, replace]) => acc.replace(regex, replace), condition
        )

    }else if(typeof condition === 'object'){
        return Object.entries(condition)
          .map(([column, value]) => (typeof(value) == 'string')?`${column} = '${value}'`:`${column} = ${value}`)
          .join(' AND ')
    }else if(typeof condition === 'function'){
        
    }
}