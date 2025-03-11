// 	Book : titre, auteur, année de publication, propriétaire (référence vers un User).

const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    titre : { type: String, required: true },
    auteur: { type: String, required: true },
    year: { type: Date, required: true }, 
    propriétaire: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
});

module.exports = mongoose.model('books', BookSchema);