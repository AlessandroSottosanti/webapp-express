import slugify from 'slugify';
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

    // Gestione filtri con valori "Statici", le cui chiavi corrispondono alle colonne del db
    for (const key in req.query) {
        if (key !== "search") {
            conditions.push(`${key} = ?`);
            params.push(req.query[key]);
        }
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
    const slug = req.params.slug;

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
            movies.slug = ? 
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
            movies.slug = ?`;

    // Query dettagli film
    connection.query(sql, [slug], (err, movies) => {
        if (err) {
            return next(err);
        }
        if (movies.length === 0 || movies[0].slug === null) {
            return res.status(404).json({
                message: "Film non trovato",
            });
        } else {
            // Query recensioni
            connection.query(reviewsSql, [slug], (err, reviews) => {
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

// const reviewValidate = (reqBody, res, next) => {
//     const { name, vote, text } = reqBody;



//     next();
// }

const storeReview = (req, res, next) => {
    const movieId = req.params.id;
    console.log(movieId);
    console.log(req.body);

    const { name, vote, text } = req.body;


    // reviewValidate(req.body, res)
    if (isNaN(vote) || vote < 1 || vote > 5) {
        return res.status(400).json({
            status: "fail",
            message: "il voto deve essere un valore numerico compreso tra 0 e 5",
        });
    }

    if (name.length <= 3) {
        return res.status(400).json({
            status: "fail",
            message: "Il nome deve contenere più di 3 caratteri",
        });
    }

    if (text && text.length > 0 && text.length < 5) {
        return res.status(400).json({
            status: "fail",
            message: "Il testo deve essere lungo almeno 6 caratteri",
        });
    }
    // verifichiamo che il film con id movieId esiste
    const movieSql = `
        SELECT *
        FROM movies
        WHERE id = ?`;

    connection.query(movieSql, [movieId], (err, results) => {
        if (err) {
            return next(err);
        }


        const sql = `
            INSERT INTO reviews(movie_id, name,vote,text)
            VALUES (?, ?, ?, ?);
        `;

        connection.query(sql, [movieId, name, vote, text], (err, results) => {
            if (err) {
                return next(err);
            }
            res.status(201).json({
                status: "success",
                message: "Recensione aggiunta"
            });
        })
    })
}

const store = (req, res, next) => {
    console.log(`salvataggio file`);
    const imageName = req.file.filename;
    const { title, director, releaseYear, genre, abstract } = req.body;

    console.log(req.body);

    const slug = slugify(title, {
        lower: true,
        strict: true
    });

    const sql = `
    INSERT INTO movies(slug, title, director , genre, release_year, abstract, image)
    VALUES(?,?,?,?,?,?,?)
    `

    connection.query(sql, [slug, title, director, genre, releaseYear, abstract, imageName], (err, results) => {
        if (err) {
            return next(err);
        }

        return res.status(201).json({
            status: "success",
            message: "Film salvato con successo"
        });
    })

}

const destroy = (req, res, next) => {
    const movieId = req.params.id;

    // Prima cerchiamo il film per vedere se esiste
    const movieSql = `SELECT * FROM movies WHERE id = ?`;

    connection.query(movieSql, [movieId], (err, results) => {
        if (err) {
            return next(err);
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Film non trovato",
            });
        }

        // Ora cancella le recensioni correlate
        const deleteReviewsSql = `DELETE FROM reviews WHERE movie_id = ?`;
        connection.query(deleteReviewsSql, [movieId], (err) => {
            if (err) {
                return next(err);
            }

            // Cancella il film dalla tabella "movies"
            const deleteMovieSql = `DELETE FROM movies WHERE id = ?`;
            connection.query(deleteMovieSql, [movieId], (err) => {
                if (err) {
                    return next(err);
                }

                return res.status(200).json({
                    status: "success",
                    message: "Film e recensioni associate cancellate con successo",
                });
            });
        });
    });
};

const modify = (req, res, next) => {
    console.log(req.body);

    const movieId = req.params.id;
    const { title, director, releaseYear, genre, abstract } = req.body;
    let image = null;

    
    // Verifica se un nuovo file immagine è stato caricato
    if (req.file) {
        image = req.file.filename; // Ottieni il nome del file immagine caricato
    }

    // Verifica se il film esiste
    const movieSql = `SELECT * FROM movies WHERE id = ?`;

    connection.query(movieSql, [movieId], (err, results) => {
        if (err) {
            return next(err);
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Film non trovato",
            });
        }

        // Se il titolo è cambiato, aggiorniamo anche lo slug
        const newSlug = title ? slugify(title, { lower: true, strict: true }) : results[0].slug;

        // SQL per aggiornare il film
        let updateSql = `
            UPDATE movies
            SET slug = ?, title = ?, director = ?, genre = ?, release_year = ?, abstract = ?
        `;
        
        const updateValues = [newSlug, title, director, genre, releaseYear, abstract];

        // Se è stato caricato un nuovo file immagine, aggiungiamo il campo image
        if (image) {
            updateSql += ", image = ?";
            updateValues.push(image);
        }

        updateSql += " WHERE id = ?;";
        updateValues.push(movieId);

        connection.query(updateSql, updateValues, (err) => {
            if (err) {
                return next(err);
            }

            return res.status(200).json({
                status: "success",
                message: "Film aggiornato con successo",
            });
        });
    });
};




export default {
    index,
    show,
    storeReview,
    store,
    destroy,
    modify
};