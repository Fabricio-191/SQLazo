class View{

}

class DatabaseViews{
    constructor(database, views){
        views.map(({ name, sql }) => {
            this[name] = new View(name, { db, SQL: sql })
        })

        //this.db = db;
    }

    /*
SELECT
   trackid,
   tracks.name,
   albums.Title AS album,
   media_types.Name AS media,
   genres.Name AS genres
FROM
   tracks
INNER JOIN albums ON Albums.AlbumId = tracks.AlbumId
INNER JOIN media_types ON media_types.MediaTypeId = tracks.MediaTypeId
INNER JOIN genres ON genres.GenreId = tracks.GenreId;
    */
    create(name, columns, tables){
        let SELECT_SQL = '';
        const _1 = '', _2 = '';
        Object.entries(tables).map(([tableName, data]) => {
            
        })
        
        [
            [
                'tabla1', [
                    ['name', 'nombre']
                ]
            ], [
                'tabla2', [
                    ['data', 'datos']
                ]
            ]
        ]
        
        

        this.db.run(`CREATE VIEW ${name}(${columns.join(', ')}) AS SELECT ${SELECT_SQL}`)
    }
}

/*
db.views.create('canciones', ['nombre', 'datos'], {
    tabla1: {
        name: 'nombre'
    },
    tabla2: {
        data: 'datos'
    }
})
*/
//nombreDelView, columnasDelView, datosDelView

/*
tablaDeDondeSacarLosDatos: {
    columnaDeDondeSacarLosDatos: columnaQueLlevaEsosDatosEnElView
}

*/

`
CREATE VIEW v_albums (
    AlbumTitle,
    Minutes
) AS
    SELECT albums.title,
        SUM(milliseconds) / 60000
    FROM tracks
        INNER JOIN albums USING (
            AlbumId
        )
    GROUP BY AlbumTitle;
`

module.exports = DatabaseViews;
