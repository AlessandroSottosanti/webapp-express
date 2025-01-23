import connection from '../data/dbConnection.js';

const index = (req, res) => {

    const sql = "SELECT * FROM `movies` "
    connection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                message: "Errore interno del server",
            });
        }
        else {
            return res.status(200).json({
                status: "success",
                data: results,
            });
        }
    });


};

const show = (req, res) => {
    const id = req.params.id;

    const sql = "SELECT * FROM `movies` WHERE id = ?";

    const reviewsSql = `SELECT reviews.* , movies.title 
    FROM reviews 
    LEFT JOIN movies 
    ON movies.id = reviews.movie_id 
    WHERE movies.id = ?`

    connection.query(sql, [id], (err, movies) => {
        if (err) {
            const resObj = {
                status: "fail",
                message: "Errore interno del server",
            }
            if (process.env.ENVIRONMENT === "development") {
                resObj.detail = err.stack;
            }
            return res.status(500).json(resObj);
        }
        else if (movies.length === 0) {
            return res.status(404).json({
                message: "Post non trovato",
            });
        }
        //  else {
        //      const movie = {
        //         ...movies,
        //          reviews: movies
        //              .filter(row => row.movie_id)
        //              .map(row => ({
        //                  id: row.reviews.id,
        //                  text: row.review_text,
        //              })),
        //      };

        //      return res.status(200).json({
        //          status: "success",
        //          data: movie,
        //      });
        //  }
        else {
            // prendiamo gli ingredienti collegati alla pizza
            connection.query(reviewsSql, [id], (err, result) => {
                if (err) {
                    const resObj = {
                        status: "fail",
                        message: "Errore interno del server",
                    }
                    if (process.env.ENVIRONMENT === "development") {
                        resObj.detail = err.stack;
                    }
                    return res.status(500).json(resObj);
                }

                else {
                    const dataMovie = movies[0];
                    console.log(result, movies[0]);

                    return res.status(200).json({
                        status: "success",
                        data: {
                            ...dataMovie,
                            result,
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