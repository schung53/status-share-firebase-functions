const {db} = require('../util/admin');

// Fetch all statuses
exports.getAllStatuses = (req, res) => {
    db
    .collection('statuses')
    .orderBy('descriptionDate', 'desc')
    .get()
    .then((data) => {
        let statuses = [];
        data.forEach((doc) => {
            statuses.push({
                statusId: doc.id,
                description: doc.data().description,
                descriptionDate: doc.data().descriptionDate,
                present: doc.data().present,
                user: doc.data().user
            });
        });
        return res.json(statuses);
    })
    .catch((err) => console.error(err));
};

// Fetch one status
exports.getStatus = (req, res) => {
    let statusData = {};
    db
    .doc(`/statuses/${req.params.statusId}`)
    .get()
    .then((doc) => {
        if (!doc.exists) {
            return res.status(404).json({error: 'Status not found'})
        }
        statusData = doc.data();
        return res.json(statusData);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json({error: err.code})
    });
};

// Create one status
exports.postOneStatus = (req, res) => {
    if (req.method !== 'POST') {
        return response.status(400).json({error: 'Method not allowed'});
    };

    const newStatus = {
        description: req.body.description,
        descriptionDate: new Date().toISOString(),
        present: req.body.present,
        user: req.body.user
    };

    db
    .collection('statuses')
    .add(newStatus)
    .then((doc) => {
        doc.set({statusId: doc.id}, {merge: true});
        res.json({ message: `document ${doc.id} created successfully`});
    })
    .catch((err) => {
        res.status(500).json({error: 'something went wrong'});
        console.error(err);
    });
};

// Update a status
exports.updateStatus = (req, res) => {
    const updatedStatus = {}

    if (!isEmpty(req.body.description.trim())) updatedStatus.description = req.body.description;
    if (!isEmpty(req.body.user.trim())) updatedStatus.user = req.body.user;

    updatedStatus.descriptionDate = new Date().toISOString();

    db
    .doc(`/statuses/${req.params.statusId}`)
    .update(updatedStatus)
    .then(() => {
        return res.json({message: "Status updated successfully"});
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};

// Delete a status
exports.deleteStatus = (req, res) => {
    db
    .doc(`/statuses/${req.params.statusId}`)
    .get()
    .then((doc) => {
        if (!doc.exists) {
            return res.status(404).json({error: 'Status not found'});
        } else {
            return db.doc(`/statuses/${req.params.statusId}`).delete();
        }
    })
    .then(() => {
        res.json({message: 'Status deleted successfully'});
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};

// Checks whether string is empty
const isEmpty = (string) => {
    if (string.trim() === '') return true;
    else return false;
};