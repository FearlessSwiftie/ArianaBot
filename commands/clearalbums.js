const Discord = require("discord.js");

module.exports = {
    name: "clearalbums",
    description: "Clears all your album roles.",
    execute(aribot, message, params) {
        let user = message.member;
        let server = message.guild;
        let albumRoles = message.member.roles;
        let yt = server.roles.get("285501288840691723"); // Yours Truly
        let me = server.roles.get("285501286038896642"); // My Everything
        let dw = server.roles.get("285501282855288842"); // Dangerous Woman
        let ntltc = server.roles.get("436798681874694144"); // No Tears Left To Cry
	let tun = server.roles.get("516257813476147200"); // thank u, next

        if (params[0] == "-h" || params[0] == "--help") {
            const embed = new Discord.RichEmbed()
            .setColor(0x0000B3)
            .setAuthor("!clearalbums", aribot.user.avatarURL)
            .addField("Usage:", "!clearalbums");

            message.channel.send({embed});
        } else {
            albumRoles.forEach( role => {
                switch (role.id) {
                    case "285501288840691723": // Yours Truly
                        user.removeRole(yt);
                        break;
                    case "285501286038896642": // My Everything
                        user.removeRole(me);
                        break;
                    case "285501282855288842": // Dangerous Woman
                        user.removeRole(dw);
                        break;
                    case "436798681874694144": // No Tears Left To Cry
                        user.removeRole(ntltc);
                        break;
		    case "516257813476147200": // thank u, next
			user.removeRole(tun);
			break;
                }
            });
            message.reply("your album roles have been cleared.");
        }
    },
};
