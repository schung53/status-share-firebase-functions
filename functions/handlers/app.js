const {db} = require('../util/admin');

const config = require('../util/config');
const { validateLoginData } = require("../util/validators");

const firebase = require('firebase');
firebase.initializeApp(config);

// Fetch app name
exports.getAppName = (req, res) => {
    db
    .doc('/appName/name')
    .get()
    .then((doc) => {
        if (!doc.exists) {
            return res.status(404).json({error: 'App name not found'})
        }
        appName = doc.data();
        return res.json(appName);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({error: err.code})
    });
};

// Set new app name
exports.setAppName = (req, res) => {
    const newAppName = {
        appName: req.body.appName
    }

    db
    .doc('/appName/name')
    .set(newAppName, { merge: true })
    .then(() => {
        return res.json(newAppName);
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};

// Log in
exports.login = (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    const { valid, errors } = validateLoginData(user);

    if (!valid) return res.status(400).json(errors);

    firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
        return data.user.getIdToken();
    })
    .then((token) => {
        return res.json({token});
    })
    .catch((err) => {
        console.error(err);
            return res
            .status(403)
            .json({general: 'Wrong credentials, please try again'})
    });
};

// Refresh login
exports.refreshLogin = (req, res) => {
    firebase.auth().currentUser.getIdToken(true)
    .then((token) => {
        return res.json({token});
    })
    .catch((err) => console.error(err))
};

// Sign up
/* exports.signup = (req, res) => {
    const newUser = {
        email: req.body.email,
        phone: req.body.phone,
        team: req.body.team,
        name: req.body.name,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    };

    let errors = {};

    if (isEmpty(newUser.email)) errors.email = 'Must not be empty';

    if (isEmpty(newUser.password)) errors.password = 'Must not be empty';

    if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    let token, userId;
    db
    .collection('users')
    .get()
    .then(() => {
        return firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
    })
    .then((data) => {
        userId = data.user.uid;
        return data.user.getIdToken();
    })
    .then((idToken) => {
        token = idToken;
        const userCredentials = {
            email: newUser.email,
            name: newUser.name,
            phone: newUser.phone,
            team: newUser.team,
            status: "",
            statusTime: new Date().toString(),
            present: true
        };
        db.collection('users').doc(userId).set(userCredentials);
    })
    .then(() => {
        return res.status(201).json({token});
    })
    .catch((err) => {
        console.error(err);
        if(err.code === 'auth/email-already-in-use'){
            return res.status(400).json({email: 'Email is already in use'});
        } else {
            return res.status(500).json({error: err.code})
        }
    });
}; */
