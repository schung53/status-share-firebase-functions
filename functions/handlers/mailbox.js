const {db, admin} = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase');

if (!firebase.apps.length) {
    firebase.initializeApp(config);
} else {
    firebase.app();
}

// Create one message
exports.postOneMessage = (req, res) => {
    if (req.method !== 'POST') {
        return res.status(400).json({error: 'Method not allowed'});
    }

    const newMessage = {
        message: req.body.message,
        messageId: "",
        readStatus: false,
        senderContact: req.body.senderContact,
        senderName: req.body.senderName,
        subject: req.body.subject,
        timestamp: new Date().getTime(),
        userId: req.params.userId
    }

    db
    .collection('mailbox')
    .doc(req.params.userId)
    .collection('messages')
    .add(newMessage)
    .then((doc) => {
        doc.set({messageId: doc.id}, {merge: true});
        newMessage.messageId = doc.id;
        return res.json(newMessage);
    })
    .catch((err) => {
        res.status(500).json({error: 'Message creation failed'});
        console.error(err);
    });
};

// Delete a message
exports.deleteMessage = (req, res) => {
    db
    .collection('mailbox')
    .doc(req.params.userId)
    .collection('messages')
    .doc(req.params.messageId)
    .get()
    .then((doc) => {
        if (!doc.exists) {
            return res.status(404).json({error: 'Message not found'});
        } else {
            return db
            .collection('mailbox')
            .doc(req.params.userId)
            .collection('messages')
            .doc(req.params.messageId)
            .delete();
        }
    })
    .then(() => {
        res.json({message: 'Message deleted successfully'});
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};

// Mark a message as read
exports.updateMessageReadStatus = (req, res) => {
    const update = {
        readStatus: true
    }

    db
    .collection('mailbox')
    .doc(req.params.userId)
    .collection('messages')
    .doc(req.params.messageId)
    .set(update, {merge: true})
    .then(() => {
        return res.json(update);
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};
