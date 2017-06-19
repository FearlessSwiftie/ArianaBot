const Discord = require("discord.js");
const config = require("./auth.json");

const aribot = new Discord.Client();

const ariData = require('./ari-data.json');

var currentTimestamp = "[" + convertTimestamp(Date.now()) + "]: ";
var version = "2017.06.19a";

var arianaSongs = ariData['songs'];
var arianaAlbums = ariData['albums'];

aribot.on("ready", () => {
    console.log(currentTimestamp + "Logged in as " + aribot.user.username + " with the ID - " + aribot.user.id + "\n" + currentTimestamp + "Ready!");
});

aribot.on("message", message => {
    var user = message.author;
    var command = message.content.split(" ");
    var params = command.slice(1, command.length).join(" ");
    var target = message.mentions.users.first();

    switch(command[0].toLowerCase()) {
        /* user commands */
        case "!album":
            var album = arianaAlbums[Math.floor(Math.random() * arianaAlbums.length)];
            message.reply("You should listen to `" + album + "`.");
            break;
        case "!commands":
        case "!help":
            commandHelp(message);
            break;
        case "!ping":
            var ping = Date.now() - message.createdTimestamp;
            message.channel.send("Response Time: `" + ping + " ms`");
            break;
        case "!rules":
            rules(message);
            break;
        case "!setalbum":
            favoriteAlbum(message);
            break;
        case "!serverinfo":
        case "!sinfo":
            serverInfo(message);
            break;
        case "!song":
            var song = arianaSongs[Math.floor(Math.random() * arianaSongs.length)];
            message.reply("You should listen to `" + song + "`.");
            break;
        case "!userinfo":
        case "!uinfo":
            userInfo(message);
            break;
        case "!version":
            message.channel.send("Current version: " + version);
            break;
        /* mod commands */
        case "!setstatus":
	    if (isMod(message)) {
		aribot.user.setGame(params);
		modlog(user.username + " set my status to: " + params + ".");
	    } else {
		message.reply("lol no :rolling_eyes:");
	    }
	    break;
        case "!settopic":
	    if(isMod(message)) {
	        message.channel.setTopic(params);
		message.reply("topic updated.");
		modlog(user.username + " changed the topic in <#" + message.channel.id + "> to: " + params + ".");
		} else {
		    message.reply("lol no :rolling_eyes:");
		}
            break;
    case "!speak": 
            if(isMod(message)) {
                message.delete();
                message.channel.send(params);
            }
            break;
    /* admin commands*/
    case "!restart":
        if(message.member.roles.exists("name", "Moonlight")) {
            message.reply("Restarting... :robot:");
            log("Restarted by " + user.username + ". Restarting...");
            process.exit(-1);
        } else {
            message.reply("lol no :rolling_eyes:");
            log(user.username + " attempted to restart me.");
        }
        break;
    /* restricted comands */
    case "!eval":
            if (message.author.id == config.ownerID) {
                if (command[1] == null) {
                    message.reply ("You have not specified what you want me to evaluate! :(");
                } else {
                    try {
                        var evaled = eval(params);
                        if (typeof evaled !== "string")
                            evaled = require("util").inspect(evaled);
                            message.channel.send("```xl\n" + clean(evaled) + "\n```");
                    } catch (err) {
                        message.channel.send("`ERROR` ```xl\n" + clean(err) + "\n```");
                    }
                }
            } else {
                message.reply("lol no :rolling_eyes:");
            }
            break;
    }
});

aribot.on("guildMemberAdd", member => {
    member.guild.channels.get(member.guild.id).send("Welcome " + member.user.username + " to the server!");
    modlog(member.user.tag + " (`" + member.user.id + "`) has joined the server.");
});

aribot.on("guildMemberRemove", member => {
    modlog(member.user.tag + " (`" + member.user.id + "`) left/was kicked from the server.");
});

function clean(text) {
    if (typeof(text) === "string") {
        return text.replace(/` /g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    } else {
        return text;
    }
}

function clearAlbum(message) {
    var albumRoles = message.member.roles;
    var christmasAndChill = message.guild.roles.find("name", "Christmas & Chill");
    var dangerousWoman = message.guild.roles.find("name", "Dangerous Woman");
    var myEverything = message.guild.roles.find("name", "My Everything");
    var yoursTruly = message.guild.roles.find("name", "Yours Truly");

    albumRoles.forEach(function (role) {
        switch(role.name) {
            case "Christmas & Chill":
	        message.member.removeRole(christmasAndChill);
		break;
	    case "Dangerous Woman":
	        message.member.removeRole(dangerousWoman);
		break;
	    case "My Everything":
		message.member.removeRole(myEverything);
		break;
	    case "Yours Truly":
		message.member.removeRole(yoursTruly);
		break;
	}
    });
}

function commandHelp(message) {
    aribot.users.get(message.author.id).send("__My Commands__:\n```json\n\"!avatar\": Posts a link to your avatar. Mention a user to get their avatar." +
            "\n\"!commands, !help\": Displays my available commands." +
            "\n\"!gift, !give\": Gives a selected amount of your Moonlight to a mentioned user. Usage: !gift/give <amount> <user>" +
            "\n\"!moonlight\": Displays the amount of Moonlight you have. Mention a user to see their Moonlight." +
            "\n\"!rules\": Displays the rules" + 
            "\n\"!setalbum\": Grants you a role based on what your favorite album is.\n\"!version\": Displays the current version the bot is running on." +
            "\n\"!serverinfo, !sinfo\": Displays the server's information." +
            "\n\"!userinfo, !uinfo\": Displays your account's information. Mention a user to see their account information.\n```");
}

function convertTimestamp(timestamp) {
/* thanks to kmaida on github for this function   *
 * source: https://gist.github.com/kmaida/6045266 */
    var d = new Date(timestamp),
	yyyy = d.getFullYear(),
	mm = ("0" + (d.getMonth() + 1)).slice(-2),
	dd = ("0" + d.getDate()).slice(-2),
	hh = d.getHours(),
	h = hh,
	min = ("0" + d.getMinutes()).slice(-2),
	ampm = "AM",
	time;
			
	if (hh > 12) {
	    h = hh - 12;
	    ampm = "PM";
	} else if (hh === 12) {
	    h = 12;
	    ampm = "PM";
	} else if (hh == 0) {
	    h = 12;
	}	
	time = yyyy + "-" + mm + "-" + dd + ", " + h + ":" + min + " " + ampm;	
	return time;
}

function favoriteAlbum(message) {
    var command = message.content.split(" ");
    var params = command.slice(1, command.length).join(" ");
  
    var christmasAndChill = message.guild.roles.find("name", "Christmas & Chill"); 
    var dangerousWoman = message.guild.roles.find("name", "Dangerous Woman");
    var myEverything = message.guild.roles.find("name", "My Everything");
    var yoursTruly = message.guild.roles.find("name", "Yours Truly");

    if (command[1] == null) {
        message.reply("you need to select your favorite album. Ariana's albums are: Dangerous Woman, My Everything, Yours Truly, and Christmas & Chill.");
        return;
    }

    switch(params.toLowerCase()) {
        case "cc":
        case "c&c":
        case "christmas & chill":
        case "christmas and chill":
            message.member.addRole(christmasAndChill);
            message.reply("your favorite album has been set to Christmas & Chill. :smiley:");
            log(message.author.tag + " (" + message.author.id + ") has added themselves to the Christmas & Chill role.");
            break;
	case "dw":
        case "dangerous woman":
            message.member.addRole(dangerousWoman);
            message.reply("your favorite album has been set to Dangerous Woman. :smiley:");
            log(message.author.tag + " (" + message.author.id + ") has added themselves to the Dangerous Woman role.");
            break;
        case "me":
        case "my everything":
            message.member.addRole(myEverything);
	    message.reply("your favorite album has been set to My Everything. :smiley:");
            log(message.author.tag + " (" + message.author.id + ") has added themselves to the My Everything role.");
            break;
        case "yt":
        case "yours truly":
            message.member.addRole(yoursTruly);
            message.reply("your favorite album has been set to Yours Truly. :smiley:");
            log(message.author.tag + " (" + message.author.id + ") has added themselves to the Yours Truly role.");
            break;
	case "clear":
	    clearAlbum(message);
	    message.reply("your favorite album has been cleared. :frowning:");
	    log(message.author.tag + " (" + message.author.id + ")  has cleared their favorite album. Appropriate roles have been removed.");
	    break;
        default:
            message.reply("woah there! That's not an Ariana album. :confused:");
            break;
    }
}

function isMod(message) {
    return message.member.roles.exists("name", "Honeymoon Avenue");
}

function log(message) {
	console.log(currentTimestamp + message);
}

function modlog(message) {
    aribot.channels.get(config.logChannel).send(message);
    console.log(currentTimestamp + message);
}

function rules(message) {
    aribot.users.get(message.author.id).send("__Rules__:\n1) Don't be a dick\n2) No NSFW pictures\n3) No spamming pictures, however " +
	    "you can spam Ariana pictures in <#285538056772255754>\n4) Please always keep the topic of conversation in <#285890540988268555> about " +
	    "Ariana. Other discussions can be held in <#285493585120591892> or <#285538056772255754>");
}

function serverInfo(message) {
    var server = message.guild;
    let embed = {
        "color": 123440,
        "thumbnail": {
            "url": server.iconURL },
        "author" : {
            "name" : server.name },
        "fields" : [{
            "name" : "Owner",
            "value" : server.owner.user.tag }, {
            "name" : "Server ID",
            "value" : server.id }, {
            "name" : "Created",
            "value" : convertTimestamp(server.createdTimestamp) }, {
            "name" : "Members",
            "value" : server.memberCount + " members." }, {
            "name" : "Channels",
            "value" : server.channels.size }, {
            "name" : "Region",
            "value" : server.region
        }]
    };
    message.channel.send({embed});
}

function userInfo(message) {
    var command = message.content.split(" ");
    var target = message.mentions.users.first();
    var params = command.slice(1, command.length).join(" ");

    var user = message.author;

    if(command[1] == null) {
        let embed = {
            "color" : 0xff0000,
            "thumbnail" : {
                "url" : user.avatarURL },
            "author" : {
                "name" : "User Info:" },
            "fields" : [{
                "name" : "Username",
                "value" : user.tag }, {
                "name" : "ID",
                "value" : user.id }, {
                "name" : "Created",
                "value" : convertTimestamp(user.createdTimestamp) }, {
                "name" : "Joined",
                "value" : convertTimestamp(message.member.joinedTimestamp)
                }]
            };
        message.channel.send({embed});
    } else {
        try {
            let embed = {
                "color" : 0xff0000,
                "thumbnail" : {
                    "url" : target.avatarURL },
                "author" : {
                    "name" : "User Info:" },
                "fields" : [{
                    "name" : "Username",
                    "value" : target.tag }, {
                    "name" : "ID",
                    "value" : target.id }, {
                    "name" : "Created",
                    "value" : convertTimestamp(target.createdTimestamp) }, {
                    "name" : "Joined",
                    "value" : convertTimestamp(message.guild.member(target).joinedTimestamp)
                }]
            };
            message.channel.send({embed});
        } catch(err) {
            console.log(convertTimestamp(Date.now()) + " - [ERROR]: " + err);
            message.reply("`" + params + "` was not found on the server. :confused:");
        }
    }
}
            
aribot.login(config.token);
