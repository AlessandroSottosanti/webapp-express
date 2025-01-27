import connection from '../data/dbConnection.js';

const index = (req, res, next) => {
    let sql = "SELECT * FROM `movies` ";
    const params = []
    const filters = req.query;
    const conditions = [];

    console.log(filters);

      // Gestione filtro "search"
      if (filters.search) {
        conditions.push("title LIKE ?");
        params.push(`%${filters.search}%`);
    }

    // Gestione filtro "genre"
    if (filters.genre) {
        conditions.push("genre = ?");
        params.push(filters.genre);
    }

    // Gestione filtro "age" (release_year)
    if (filters.age) {
        conditions.push("release_year = ?");
        params.push(filters.age);
    }



    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }
    
    connection.query(sql, params, (err, results) => {
        if (err) {
            return next(err);
        }
        else {
            return res.status(200).json({
                status: "success",
                data: results,
            });
        }
    });


};

const show = (req, res, next) => {
    const id = req.params.id;

    const sql = `
        SELECT 
            movies.*, 
            CAST(AVG(reviews.vote) AS FLOAT) AS vote_avg 
        FROM 
            movies 
        LEFT JOIN 
            reviews 
        ON 
            movies.id = reviews.movie_id 
        WHERE 
            movies.id = ? 
        GROUP BY 
            movies.id`;

    const reviewsSql = `
        SELECT 
            reviews.*, 
            movies.title 
        FROM 
            reviews 
        LEFT JOIN 
            movies 
        ON 
            movies.id = reviews.movie_id 
        WHERE 
            movies.id = ?`;

    // Query dettagli film
    connection.query(sql, [id], (err, movies) => {
        if (err) {
            return next(err); 
        }
        if (movies.length === 0 || movies[0].id === null) {
            return res.status(404).json({
                message: "Film non trovato",
            });
        } else {
            // Query recensioni
            connection.query(reviewsSql, [id], (err, reviews) => {
                if (err) {
                    return next(err); 
                } else {
                    const dataMovie = movies[0];

                    return res.status(200).json({
                        status: "success",
                        data: {
                            ...dataMovie, // Dettagli del film
                            reviews, // Dettagli recensioni
                        },
                    });
                }
            });
        }
    });
};


export default {
    index,
    show
};