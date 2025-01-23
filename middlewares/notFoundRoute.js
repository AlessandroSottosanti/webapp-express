const notFoundRoute = (req, res, next) => {
    res.statusCode = 404;
    res.json({
        errore: true,
        message: "Pagina non trovata"
    });
}

export default { notFoundRoute };