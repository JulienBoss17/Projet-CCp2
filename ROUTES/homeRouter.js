const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../MODELS/Users");
const Book = require("../MODELS/Books");
const validator = require("validator")

const verifySession = require("../MIDDLEWARES/verifysession");
const verifySession2 = require("../MIDDLEWARES/verifysession2")

router.get("/", async (req, res) => {
    const User = req.session.user;
    const books = await Book.find().populate("propriétaire", "nom prenom status")
    Message = "Bienvenue sur mon CCp2"
    res.render("home", { Message, books, User });
})

router.get("/compte", async (req, res) => {
    const users = await User.find().sort({ nom: 1 });
    res.render("compte", { users } );
});

// utilisateur

router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!validator.isEmail(email)) {
            return res.redirect("/compte"); 
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.redirect("/compte"); 
        }

        if (!password) {
            return res.status(400).json({ message: "Mot de passe requis" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ ...req.body, password: hashedPassword });

        await newUser.save();

        return res.redirect("/compte"); 

    } catch (err) {
        if (!res.headersSent) {  
            console.error("Erreur lors de l'inscription :", err);
            return res.status(500).json({ message: err.message });
        }
    }
});


router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email});

        if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
            return res.redirect('/compte');
        }

        user.status = 'Connecté'; 
        await user.save();

        req.session.user = user;
        req.session.userId = user._id;
        req.session.status = user.status;

        req.session.save(err => {
            if (err) {
                console.error('Erreur lors de la sauvegarde de la session:', err);
                return res.status(500).send('Erreur serveur.');
            }
            res.redirect('/'); 
        });
    } catch (error) {
        console.error('Erreur lors de la tentative de connexion:', error);
        res.status(500).send('Erreur serveur.');
    }
})

router.post("/logout", verifySession2(),async (req, res) => {
    try {
        const userId = req.session.userId;  

        if (!userId) {
            return res.redirect('/');
        }

        const user = await User.findById(userId);

        if (user) {
            user.status = 'Non connecté';
            await user.save();
        }

        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Erreur lors de la déconnexion');
            }
            res.redirect('/'); 
        });
    } catch (err) {
        console.error('Erreur lors de la déconnexion:', err.message);
        res.status(500).json({ message: err.message });
    }
});

router.get("/deleteuser/:id", verifySession2(),async (req, res) => {
    res.render("deleteuser");
});
router.delete("/deleteuser/:id", verifySession2(),async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        const user2 = await User.findById(req.session.userId)


        if(user._id.toString() !== user2._id.toString()) {
            res.redirect("/compte")
        }

        await Book.deleteMany({ propriétaire: userId });
        await User.findByIdAndDelete(userId);

        if (req.session.userId === userId) {
            req.session.status = 'Non connecté'; 
            req.session.userId = null; 
            req.session.user = null; 

            req.session.save(err => {
                if (err) {
                    console.error('Erreur lors de la mise à jour de la session:', err);
                    return res.status(500).send('Erreur serveur.');
                }
                res.redirect("/compte");
            });
        } else {
            res.redirect("/compte");
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// livres

router.post("/add-book/:id", verifySession2(),async (req, res) => {
    try {
        const userId = req.session.userId; 
        const { titre, auteur, year } = req.body;

        const newBook = new Book({
            titre,
            auteur,
            year,
            propriétaire: userId
        });

        await newBook.save();

        res.redirect("/");
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/showmybooks/:id", verifySession2(),async (req, res) => {
    const userId = req.params.id
    try {
        const user = await User.findById(userId);
        const user2 = await User.findById(req.session.userId)


        if(user._id.toString() !== user2._id.toString()) {
            res.redirect("/compte")
        }
        const books = await Book.find({ propriétaire: userId });
        res.render("showBook", { books });
    }
    catch(err) {
        res.status(500).json({message: err.message})
    }
});

router.get("/deletebook/:id", verifySession("admin"), async (req, res) => {
    const bookId = req.params.id
    try {
        const book = await Book.findByIdAndDelete(bookId);
        res.redirect("/")
    }
    catch {
        res.status(500).json({message: err.message})
    }
})

router.get("/editbook/:id", verifySession2(),async (req, res) => {
    const bookId = req.params.id
    try {
        const book = await Book.findById(bookId);
        const user = await User.findById(req.session.userId)

        if (book.propriétaire.toString() !== user._id.toString()) {
            res.redirect("/")
        }
        res.render("editbook", { book });
    }
    catch {
        res.status(500).json({message: err.message})
    }
})

router.put("/editbook/:id", verifySession2(),async (req, res) => {
    const bookId = req.params.id
    try {
        const { titre, auteur, year } = req.body;
        const book = await Book.findById(bookId);
        const user = await User.findById(req.session.userId)

        if (book.propriétaire.toString() !== user._id.toString()) {
            res.redirect("/")
        }

        book.titre = titre;
        book.auteur = auteur;
        book.year = year;

        await book.save();
        res.redirect("/")
    }
    catch
    {
        res.status(500).json({ message: err.message })
    }

})

module.exports = router;