import multer from "multer";

// Setto le impostazioni di salvataggio del file
const storage = multer.diskStorage({
    destination: (req, file, callbackFn) => {
        // Impostazione della posizione di salvataggio del file
        callbackFn(null, "public/movies_cover");
    },
    filename: (req, file, callbackFn) => {
        // prendo il nome del file caricato
        const originalFileName = file.originalname;
        // Aggiungo il timestamp per assicurarmi che il nome non si ripeta
        const uniqueName = `${Date.now()}-${originalFileName}`;
        callbackFn(null, uniqueName);
    }
})

// Creo l'istanza di multer passandogli le opzioni di salvataggio
const upload = multer({storage});

export default upload;