const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./util/fbAuth');

const cors = require('cors');
const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.json());

const {
    getUser,
    postOneUser,
    updateUserDetails,
    updateUserStatus,
    updateUserMemo,
    updateUserPresence,
    deleteUser
} = require('./handlers/users');

const {
    getTeams,
    postOneTeam,
    deleteTeam,
    updateTeam
} = require('./handlers/teams');

const {
    getAppName,
    setAppName,
    login,
    refreshLogin
} = require('./handlers/app');

const {
    postOneMessage,
    deleteMessage,
    updateMessageReadStatus,
    updateMessage
} = require('./handlers/mailbox');

exports.api = functions.https.onRequest(app);

// User routes
app.get('/user/:userId', getUser);
app.post('/user', FBAuth, postOneUser);
app.post('/user/:userId', FBAuth, updateUserDetails);
app.post('/user/memo/:userId', FBAuth, updateUserMemo);
app.post('/user/status/:userId', FBAuth, updateUserStatus);
app.post('/user/presence/:userId', FBAuth, updateUserPresence);
app.delete('/user/:userId', FBAuth, deleteUser); 

// Team routes
app.get('/teams', getTeams);
app.post('/team', FBAuth, postOneTeam);
app.post('/team/delete/:teamId', FBAuth, deleteTeam);
app.post('/team/:teamId', FBAuth, updateTeam); 

// App routes
app.get('/appname', getAppName);
app.post('/appname', FBAuth, setAppName);
app.post('/login', login);
app.post('/refreshlogin', refreshLogin);

// Mailbox routes
app.post('/mailbox/:userId', FBAuth, postOneMessage);
app.delete('/mailbox/:userId/:messageId', FBAuth, deleteMessage);
app.post('/mailbox/read/:userId/:messageId', FBAuth, updateMessageReadStatus);
// app.post('/mailbox/update/:userId/:messageId', FBAuth, updateMessage);
