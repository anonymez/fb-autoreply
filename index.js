var login = require("facebook-chat-api");
var readline = require('readline-sync');
var moment = require('moment');
var tsreplies = {};
var fs = require('fs')
const filename = "appstate.json";

var handleChat = function(err, api) {
    if (err) return console.error(err);
    fs.writeFileSync(filename, JSON.stringify(api.getAppState())); 

    api.getFriendsList(function(err, friendsList) {
        if(err) return console.log(err);
        api.listen(function (err, msg) {
            if (err) return console.error(err);
            if (!msg.body) return;
            var sender = msg.senderID;
            var senderFriend = friendsList.filter(function (friend) {
                return (friend.userID == sender.toString());
            }); 
                                        
            if (senderFriend.length > 0) {
                if (!tsreplies[sender.toString()] || (tsreplies[sender.toString()] && (moment.duration(tsreplies[sender.toString()].diff(moment())).asMinutes() < -5))) {
                    api.sendMessage("MESSAGGIO AUTOMATICO: Ciao " + senderFriend[0].firstName + ", sono al momento assente. Per le urgenze contattami via e-mail o cellulare.\nPatrizio", msg.threadID);
                    tsreplies[sender.toString()] = moment();
                }
            }

        });
    });
};

try {
	var application_state = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));
	login({appState: application_state}, handleChat);
}
catch (e) {
	var email = readline.question('E-mail -> ');
	var password = readline.question('Password -> ', {hideEchoBack: true});
	login({email: email, password: password}, handleChat);
}
