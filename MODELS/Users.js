const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    prenom: {type: String},
    nom: {type: String},
    password: {type: String},
    role: {type: String, enum: ['admin', 'user'], default: 'user'},
    status: {
      type: String,
      enum: ['Connecté', 'Non connecté'], 
      default: 'Non connecté'
    },
})

const User = mongoose.model('users', UserSchema)

module.exports = User