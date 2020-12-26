const {db} = require('../util/admin');

const config = require('../util/config');

const firebase = require('firebase');
firebase.initializeApp(config);

// Fetch teams
exports.getTeams = (req, res) => {
    db
    .collection('teams')
    .get()
    .then((data) => {
        let teams = [];
        data.forEach((doc) => {
            teams.push({
                team: doc.data().team,
                priority: doc.data().priority,
                color: doc.data().color,
                teamId: doc.data().teamId
            });
        });
        return res.json(teams);
    })
    .catch((err) => console.error(err))
};

// Create a new team
exports.postOneTeam = (req, res) => {
    const newTeam = {
        team: req.body.team,
        priority: req.body.priority,
        color: req.body.color,
        teamId: ""
    }

    db
    .collection('teams')
    .add(newTeam)
    .then((doc) => {
        doc.set({teamId: doc.id}, {merge: true});
        newTeam.teamId = doc.id;
        return res.json(newTeam);
    })
    .catch((err) => {
        res.status(500).json({error: 'something went wrong'});
        console.error(err);
    });
};

// Update a team's details
exports.updateTeam = (req, res) => {
    const updatedTeam = {
        team: req.body.team,
        priority: req.body.priority,
        color: req.body.color,
        teamId: req.params.teamId
    }
    const prevTeam = {prevTeam: req.body.prevTeam};
    db
    .doc(`/teams/${req.params.teamId}`)
    .update(updatedTeam)
    .then(() => {
        return res.json(updatedTeam);
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });

    db
    .collection('/users/')
    .where('teamId', '==', updatedTeam.teamId)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            doc.ref.set({team: updatedTeam.team}, {merge: true});
        })
    })
    .then(() => {
        res.json({message: 'Team updated successfully'});
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};

// Delete a team
exports.deleteTeam = (req, res) => {
    const teamToDelete = {
        team: req.body.team,
        teamId: req.params.teamId
    }

    db
    .doc(`/teams/${req.params.teamId}`)
    .get()
    .then((doc) => {
        if (!doc.exists) {
            return res.status(404).json({error: 'Team not found'});
        } else {
            return db.doc(`/teams/${req.params.teamId}`).delete();
        }
    });
    
    db
    .collection('/users/')
    .where('teamId', '==', teamToDelete.teamId)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            doc.ref.delete();
        })
    })
    .then(() => {
        res.json({message: 'Team deleted successfully'});
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};
