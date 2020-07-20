class Database {
    constructor(path){
        searchErrors("Database", path);
        if(!path.endsWith(".db")) path += ".db"

        this.db = new BSDatabase(path);
        this.statements = {
            getTables: this.db.prepare("SELECT * FROM sqlite_master WHERE type = 'table'"),

        }
    };

    //tables

    createTable(tableName, sample) {
        //searchErrors("createTable", tableName, sample)

        var SQL = Object.entries(sample)
          .map(c => c[0]+' '+SQLType(c[1]) )
          .join(', ');

        
        try{
            this.db.prepare(`CREATE TABLE IF NOT EXISTS ${tableName}(${SQL})`).run();
            return new Table(tableName, this);
        }catch(e) { console.error(e); return false; }
    }

    deleteTable(tableName){
        searchErrors("deleteTable", tableName)

        try{
            this.db.prepare(`DROP TABLE IF EXISTS ${tableName}`).run(); 
            return true;
        }catch(e) { console.error(e); return false; }
    }

    getTables(){
        try{
            return this.statements.getTables.all().map(t => {
                var table = new Table(t.name, this);
                table.sql = t.sql;
                return table;
            })
        }catch(e) { console.error(e); return false; }
    }

    moveData(oldTable, newTable){
        searchErrors("moveData", oldTable, newTable);

        try{
            var data = this.getData(oldTable, true)
            if(data === false) console.error(new Error("The old table hasn't data")) 
            
            data.map(dat => {
                if(!this.insertData(newTable, dat)) e = true;
            })
            return true;
        }catch(e) { console.error(e); return false; }
    }

    //data

    insertData(tableName, data){
        searchErrors("insertData", tableName, data);


        var columns = Object.keys(data)
            .join(', ')

        var values = Object.values(data)
            .map(c => typeof(c) == "string"?`'${c}'`:`${c}`)
            .join(', ')

        try{
            this.db.prepare(`INSERT INTO ${tableName}(${columns}) VALUES(${values})`).run();
            return true;
        }catch(e) { console.error(e); return false; }
    }

    getData(tableName, condition){
        searchErrors("getData", tableName, null, condition);

        var SQL = `SELECT * FROM ${tableName}`
        if(condition !== true) {
            var SQL_condition = Object.entries(condition)
                .map(c => (typeof(c[1]) == "string")?`${c[0]} = '${c[1]}'`:`${c[0]} = ${c[1]}`)
                .join(" AND ")

            SQL += ` WHERE ${SQL_condition}`
        }
        
        try{
            var rows = this.db.prepare(SQL).all();
            return rows;
        }catch(e) { console.error(e); return false; }
    }

    deleteData(tableName, condition){
        searchErrors("deleteData", tableName, null, condition);

        var SQL = `DELETE FROM ${tableName}`
        if(condition !== true) {
            var SQL_condition = Object.entries(condition)
                .map(c => (typeof(c[1]) == "string")?`${c[0]} = '${c[1]}'`:`${c[0]} = ${c[1]}`)
                .join(" AND ")

            SQL += ` WHERE ${SQL_condition}`
        }
        
        try{
            this.db.prepare(SQL).run();
            return true;
        }catch(e) { console.error(e); return false; }
    }

    updateData(tableName, condition, data){
        searchErrors("updateData", tableName, data, condition);

        var SQL_data = Object.entries(data)
            .map(c => (typeof(c[1]) == "string")?`${c[0]} = '${c[1]}'`:`${c[0]} = ${c[1]}`)
            .join(', ')

        var SQL = `UPDATE ${tableName} SET ${SQL_data}`
        if(condition !== true) {
            var SQL_condition = Object.entries(condition)
                .map(c => (typeof(c[1]) == "string")?`${c[0]} = '${c[1]}'`:`${c[0]} = ${c[1]}`)
                .join(" AND ")

            SQL += ` WHERE ${SQL_condition}`
        }
        
        try{
            this.db.prepare(SQL).run();
            return true;
        }catch(e) { console.error(e); return false; }
    }
}