import connection from '../data/dbConnection.js';


const index = (req, res, next) => {
    let sql = "SELECT DISTINCT `movies`.`release_year` FROM `movies` ORDER BY `release_year` ;";
    const params = [req.query]

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

}

export default {index};