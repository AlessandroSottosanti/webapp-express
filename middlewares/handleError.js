const handleError = ( err, req, res, next) => {
    const resObj = {
        status: "fail",
        message: "Errore interno del server",
    }
    if (process.env.ENVIRONMENT === "development") {
        resObj.detail = err.stack;
    }
    return res.status(500).json(resObj);
}

export default handleError;
