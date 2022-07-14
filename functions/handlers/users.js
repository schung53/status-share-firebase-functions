const {db} = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase');

if (!firebase.apps.length) {
    firebase.initializeApp(config);
} else {
    firebase.app();
}

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
        teamId: req.body.teamId,
        status: "",
        statusTime: new Date().toString(),
        present: true,
        checkinPeriod: "",
        memo: "",
        priority: req.body.priority,
        userId: "",
        unreadMessages: 1
    }

    db
    .collection('users')
    .add(newUser)
    .then((doc) => {
        const newUserId = doc.id;

        doc.set({userId: newUserId}, {merge: true});
        newUser.userId = newUserId;

        db
        .collection('mailbox')
        .doc(newUserId)
        .set({
            userId: newUserId
        })

        db
        .collection('mailbox')
        .doc(newUserId)
        .collection('messages')
        .add({
            message: "Auto-generated message",
            messageId: "",
            readStatus: false,
            senderContact: "sysadmin",
            senderName: "sysadmin",
            subject: "Mailbox initialized",
            timestamp: new Date().getTime(),
            userId: newUserId
        })
        .then((msgDoc) => {
            msgDoc.set({messageId: msgDoc.id}, {merge: true});
        });

        return res.json(newUser);
    })
    .catch((err) => {
        res.status(500).json({error: 'User creation failed'});
        console.error(err);
    });
};

// Update a user's details
exports.updateUserDetails = (req, res) => {
    const updatedUser = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        team: req.body.team,
        memo: req.body.memo,
        priority: req.body.priority,
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
        statusTime: req.body.statusTime,
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
};

// Update a user's presence
exports.updateUserPresence = (req, res) => {

    const presence = req.body.present;
    const userId = req.params.userId;

    db.doc(`/users/${userId}`)
    .set({present: presence}, { merge: true })
    .then(() => {
        return res.json({present: presence});
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};

// Update a user's checkin period
exports.updateUserCheckinPeriod = (req, res) => {
    
    const checkinPeriod = req.body.checkinPeriod;
    const userId = req.params.userId;

    db.doc(`/users/${userId}`)
    .set({checkinPeriod: checkinPeriod}, { merge: true })
    .then(() => {
        return res.json({checkinPeriod: checkinPeriod});
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
};

// Delete a user
exports.deleteUser = (req, res) => {
    db
    .doc(`/users/${req.params.userId}`)
    .get()
    .then((doc) => {
        if (!doc.exists) {
            return res.status(404).json({error: 'User not found'});
        } else {
            db.doc(`/users/${req.params.userId}`).delete();

            db.collection('mailbox').doc(req.params.userId).delete();
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
