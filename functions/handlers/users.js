const {db} = require('../util/admin');

const config = require('../util/config');
const { validateLoginData } = require("../util/validators");

const firebase = require('firebase');
firebase.initializeApp(config)

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

// Fetch all users
exports.getAllUsers = (req, res) => {
    /* db
    .collection('users')
    .get()
    .then((data) => {
        let users = [];
        data.forEach((doc) => {
            users.push({
                userId: doc.id,
                email: doc.data().email,
                name: doc.data().name,
                phone: doc.data().phone,
                team: doc.data().team,
                status: doc.data().status,
                statusTime: doc.data().statusTime,
                present: doc.data().present,
                memo: doc.data().memo
            });
        });
        return res.json(users);
    })
    .catch((err) => console.error(err)); */
};

// Fetch one user
exports.getUser = (req, res) => {
    let userData = {};
    db
    .doc(`/users/${req.params.userId}`)
    .get()
    .then((doc) => {
        if (!doc.exists) {
            return res.status(404).json({error: 'User not found'})
        }
        userData = doc.data();
        return res.json(userData);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({error: err.code})
    });
};

// Create one user
exports.postOneUser = (req, res) => {
    if (req.method !== 'POST') {
        return res.status(400).json({error: 'Method not allowed'});
    }

    const newUser = {
        email: req.body.email,
        name: req.body.name,
        phone: req.body.phone,
        team: req.body.team,
        status: "",
        statusTime: new Date().toString(),
        present: true,
        memo: "",
        userId: ""
    }

    db
    .collection('users')
    .add(newUser)
    .then((doc) => {
        doc.set({userId: doc.id}, {merge: true});
        newUser.userId = doc.id;
        return res.json(newUser);
    })
    .catch((err) => {
        res.status(500).json({error: 'something went wrong'});
        console.error(err);
    });
};

// Update a user's details
exports.updateUserDetails = (req, res) => {
    const updatedUser = {
        email: req.body.email,
        phone: req.body.phone,
        team: req.body.team,
        memo: req.body.memo,
        userId: req.params.userId
    }

    db
    .doc(`/users/${req.params.userId}`)
    .set(updatedUser, { merge: true })
    .then(() => {
        return res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};

// Update a user's status
exports.updateUserStatus = (req, res) => {

    const update = {
        status: req.body.status,
        statusTime: new Date().toString(),
        userId: req.params.userId
    }

    db.doc(`/users/${req.params.userId}`)
    .set(update, { merge: true })
    .then(() => {
        return res.json(update);
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
}

// Update a user's presence
exports.updateUserPresence = (req, res) => {

    const update = {
        present: req.body.present,
        userId: req.params.userId
    }

    db.doc(`/users/${req.params.userId}`)
    .set(update, {merge: true})
    .then(() => {
        return res.json(update);
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
}

// Update a user's memo
exports.updateUserMemo = (req, res) => {

    db.doc(`/users/${req.params.userId}`)
    .set({memo: req.body.memo}, {merge: true})
    .then(() => {
        return res.json({message: "User memo updated successfully"});
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
}

// Delete a user
exports.deleteUser = (req, res) => {
    db
    .doc(`/users/${req.params.userId}`)
    .get()
    .then((doc) => {
        if (!doc.exists) {
            return res.status(404).json({error: 'User not found'});
        } else {
            return db.doc(`/users/${req.params.userId}`).delete();
        }
    })
    .then(() => {
        res.json({message: 'User deleted successfully'});
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
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

// Checks whether string is empty
const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
};

// Fetch users with real time updates
exports.snapshotAllUsers = (req, res) => {
    /* db
    .collection('users')
    .onSnapshot((snapshot) => {
        let users = [];
        //let changes = snapshot.docChanges();
        snapshot.docs.forEach((doc) => {
            users.push({
                userId: doc.id,
                email: doc.data().email,
                name: doc.data().name,
                phone: doc.data().phone,
                team: doc.data().team,
                status: doc.data().status,
                statusTime: doc.data().statusTime,
                present: doc.data().present,
                memo: doc.data().memo
            });
        });
        return res.json(users);
    }) */
};

// Fetch teams
exports.getTeams = (req, res) => {
    db
    .collection('teams')
    .get()
    .then((data) => {
        let teams = [];
        data.forEach((doc) => {
            teams.push({
                team: doc.data().team
            });
        });
        return res.json(teams);
    })
    .catch((err) => console.error(err))
}