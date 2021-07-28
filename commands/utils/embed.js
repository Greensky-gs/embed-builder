const Discord = require('discord.js');

/**
 * @param {Discord.Message} message
 * @param {Array} args
 * @param {Discord.Client} client
 */
module.exports.run = async(message, args, client) => {
    const functions = {
      del: async(msg) => {
        if (msg.deletable && !msg.deleted) {
          await msg.delete().catch(() => {});
        };
      }
    };
    
    const embeds = {
        collectorNoMessage: () => {
            return new Discord.MessageEmbed()
                .setTitle(":x: Vous n'avez rien envoyé")
                .setDescription(`:x: | Vous n'avez envoyé aucun message`)
                .setColor('RED')
                .setTimestamp()
        },
        canceled: () => {
            return new Discord.MessageEmbed()
                .setTitle(":bulb: Commande annulée")
                .setColor('YELLOW')
        },
        noValidLink: () => {
            return new Discord.MessageEmbed()
                .setTitle(":x: Lien invalide")
                .setDescription(`:x: | Le lien est invalide`)
                .setTimestamp()
                .setColor('RED')
        }
    }


    await message.channel.send(new Discord.MessageEmbed()
        .setTitle("Patientez")
        .setDescription(`Attendez l'ajout des réactions`)
    ).then(async(menuiserie) => {
        const reactionsArray = [
            {emoji: '🏷', description: "Modifier le titre", fnt: 'title'},
            {emoji: '📜', description: "Modifier la description", fnt: "description"},
            {emoji: "🎨", description: "Modifier la couleur de l'embed", fnt: "color"},
            {emoji: "📖", description: "Configurer l'auteur de l'embed", fnt: "author_text"},
            {emoji: '📕', description: "Ajouter une image à l'auteur de l'embed", fnt: "author_img"},
            {emoji: '🖼', description: "Modifier l'image de l'embed (avec un lien)", fnt: "img"},
            {emoji: '✨', description: "Ajouter un champs de texte", fnt: 'field'},
            {emoji: '📘', description: 'Ajouter un pied-de-page', fnt: "footer_text"},
            {emoji: '📙', description: "Configurer l'image du pied-de-page", fnt: "footer_img"},
            {emoji: '⌚', description: "Mettre le timestamp", fnt: "timestamp"},
            {emoji: '🧵', description: "Modifier le lien du titre", fnt: "url"},
            {emoji: "🖌", description: "Mettre le thumbnail de l'embed", fnt: "thumbnail"},
            {emoji: "✅", description: "Valider l'envoi", fnt: "send"},
            {emoji: "❌", description: "Annuler la commande", fnt: 'cancel'}
        ];
        reactionsArray.filter(x => !x.description.includes('Annuler')).forEach(async(emoji) => {
            await menuiserie.react(emoji.emoji).catch(() => {});
        });
        await menuiserie.react('❌').then(async(menu1) => {
            const menu = menu1.message;

            const menuEmbed = new Discord.MessageEmbed()
                .setTimestamp()
                .setTitle("Menu")
                .setColor("ORANGE")
                .setDescription(`Vous avez 10 minutes pour construire votre embed`)
            
            let i = 0;
            reactionsArray.forEach(async(reaction) => {
                if (i < 3) {
                    i++;
                    menuEmbed.addField(reaction.emoji, `cliquez sur ${reaction.emoji} pour ${reaction.description}`, true);
                } else {
                    i = 0;
                    menuEmbed.addField(reaction.emoji, `cliquez sur ${reaction.emoji} pour ${reaction.description}`, false);
                };
            });

            menu.edit(menuEmbed);

            const regex = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/g;

            const embed = new Discord.MessageEmbed()
                .setDescription(`<@${message.author.id}>, ceci est __**votre**__ embed, à vous de le personnaliser !`)

            const embedMSG = await message.channel.send(embed);
            const edit = async() => {
                await embedMSG.edit(embed).catch(() => {});
            };
            const change = () => {
                encours = false;
            };

            const bigCollector = menu.createReactionCollector((r, u) => u.id === message.author.id && reactionsArray.filter(x => x.emoji === r.emoji.name).length === 1, {time: 1000*60*10});

            let encours = false;
            let envoyed = false;

            const fnts = {
                title: async() => {
                    const collector = message.channel.createMessageCollector((msg) => msg.author.id === message.author.id, {time: 120000});
                    var toSupp = [];
                    message.channel.send(new Discord.MessageEmbed().setFooter(`Tapez cancel pour annuler et vous avez deux minutes`)
                        .setTimestamp()
                        .setColor('ORANGE')
                        .setTitle("Titre")
                        .setDescription(`❓ | Quel est le titre de l'embed ?`)
                    ).then(async(x) => {toSupp.push(x)});

                    collector.on('collect', async(msg) => {
                        toSupp.push(msg);
                        if (msg.content.toLowerCase() === 'cancel') return collector.stop() & message.channel.send(new Discord.MessageEmbed()
                            .setTitle(":bulb: Commande annulée")
                            .setColor("YELLOW")
                        ).then(x => {setTimeout(() => {del(x)}, 1000)});

                        embed.setTitle(msg.content);
                        edit();
                        collector.stop();
                    });
                    collector.on('end', async(c, r) => {
                        change();
                        toSupp.forEach(async(msg) => {
                            if (msg.deletable && !msg.deleted) await msg.delete().catch(() => {});
                        });
                        if (!c.size) return message.channel.send(embeds.collectorNoMessage()).then(x =>{setTimeout(() => {functions.del(x)}, 10000)});
                    });
                },
                description: async() => {
                    const collector = message.channel.createMessageCollector((msg) => msg.author.id === message.author.id, {time: 120000});
                    var toSupp = [];
                    message.channel.send(new Discord.MessageEmbed().setFooter(`Tapez cancel pour annuler et vous avez deux minutes`)
                        .setTimestamp()
                        .setColor('ORANGE')
                        .setTitle("Description")
                        .setDescription(`❓ | Quelle est la description de l'embed ?`)
                    ).then(async(x) => {toSupp.push(x)});

                    collector.on('collect', async(msg) => {
                        toSupp.push(msg);
                        if (msg.content.toLowerCase() === 'cancel') return collector.stop() & message.channel.send(new Discord.MessageEmbed()
                            .setTitle("Annulé")
                            .setTimestamp()
                            .setDescription(`:white_check_mark: | Annulation de la création de la description`)
                            .setColor("GREEN")
                        ).then(x => {setTimeout(() => {functions.del(x)}, 1000)});

                        embed.setDescription(msg.content);
                        edit();
                        collector.stop();
                    });
                    collector.on('end', async(c, r) => {
                        change();
                        toSupp.forEach(async(msg) => {
                            if (msg.deletable && !msg.deleted) await msg.delete().catch(() => {});
                        });
                        if (!c.size) return message.channel.send(embeds.collectorNoMessage()).then(x =>{setTimeout(() => {functions.del(x)}, 10000)});
                    });
                },
                color: async() => {
                    const collector = message.channel.createMessageCollector((msg) => msg.author.id === message.author.id, {time: 120000});
                    var toSupp = [];
                    message.channel.send(new Discord.MessageEmbed().setFooter(`Tapez cancel pour annuler et vous avez deux minutes`)
                        .setTimestamp()
                        .setColor('ORANGE')
                        .setTitle("Couleur")
                        .setDescription(`❓ | Quelle est la couleur de l'embed ?`)
                    ).then(async(x) => {toSupp.push(x)});

                    collector.on('collect', async(msg) => {
                        toSupp.push(msg);
                        if (msg.content.toLowerCase() === 'cancel') return collector.stop() & message.channel.send(new Discord.MessageEmbed()
                            .setTitle("Annulé")
                            .setTimestamp()
                            .setColor("GREEN")
                            .setDescription(`✅ | Annulation de la modification de la couleur de l'embed :x:`)
                        ).then(x => {setTimeout(() => {functions.del(x)}, 1000)});

                        const colorsArray = [{name: "RED", aliases: ['ROUGE']}, {name: "GREEN", aliases: ['VERT']}, {name: "PRUPLE", aliases: ['violet']}, {name: "ORANGE"}, {name: "BLUE", aliases: ['BLEU']}, {name: "BLACK", aliases: ['NOIR']}, {name: "GREY", aliases: ['GRIS']}, {name: 'YELLOW', aliases: ['JAUNE']}];

                        const color = msg.content.toUpperCase();
                        if (!color.startsWith("#") && !colorsArray.filter(x => (x.name === color.toUpperCase() || x.aliases && x.aliases.includes(color.toUpperCase()))).length) return message.channel.send(`:x: Vous n'avez pas spécifié de couleur **valide**.\nVeuillez réessayer (exemple: \`#ff0000\` ou \`red\`)`).then(x => {setTimeout(() => {functions.del(x)}, 10000)});

                        embed.setColor(color);
                        edit();
                        collector.stop()
                    });
                    collector.on('end', async(c, r) => {
                        change();
                        toSupp.forEach(async(msg) => {
                            if (msg.deletable && !msg.deleted) await msg.delete().catch(() => {});
                        });
                        if (!c.size) return message.channel.send(embeds.collectorNoMessage()).then(x =>{setTimeout(() => {functions.del(x)}, 10000)});
                    });
                },
                author_text: async() => {
                    const collector = message.channel.createMessageCollector((msg) => msg.author.id === message.author.id, {time: 120000});
                    var toSupp = [];
                    message.channel.send(new Discord.MessageEmbed().setFooter(`Tapez cancel pour annuler et vous avez deux minutes`)
                        .setTimestamp()
                        .setColor('ORANGE')
                        .setTitle("Titre de l'auteur")
                        .setDescription(`❓ | Quel est le titre de l'auteur ?`)
                    ).then(async(x) => {toSupp.push(x)});

                    collector.on('collect', async(msg) => {
                        toSupp.push(msg);
                        if (msg.content.toLowerCase() === 'cancel') return collector.stop() & message.channel.send(new Discord.MessageEmbed()
                            .setTitle("Annulé")
                            .setTimestamp()
                            .setDescription(`✅ | Annulation de la modification du titre de l'auteur`)
                            .setColor("GREEN")
                        ).then(x => {setTimeout(() => {functions.del(x)}, 1000)});

                        embed.setAuthor(msg.content);
                        edit();
                        collector.stop();
                    });
                    collector.on('end', async(c, r) => {
                        change();
                        toSupp.forEach(async(msg) => {
                            if (msg.deletable && !msg.deleted) await msg.delete().catch(() => {});
                        });
                        if (!c.size) return message.channel.send(embeds.collectorNoMessage()).then(x =>{setTimeout(() => {functions.del(x)}, 10000)});
                    });
                },
                author_img: async() => {
                    const collector = message.channel.createMessageCollector((msg) => msg.author.id === message.author.id, {time: 120000});
                    var toSupp = [];
                    message.channel.send(new Discord.MessageEmbed().setFooter(`Tapez cancel pour annuler et vous avez deux minutes`)
                        .setTimestamp()
                        .setTitle("Image de l'auteur")
                        .setDescription(`❓ | Quelle est l'image de l'auteur de l'embed ?`)
                        .setColor('ORANGE')
                    ).then(async(x) => {toSupp.push(x)});

                    collector.on('collect', async(msg) => {
                        toSupp.push(msg);
                        if (msg.content.toLowerCase() === 'cancel') return collector.stop() & message.channel.send(embeds.canceled()).then(x => {setTimeout(() => {functions.del(x)}, 1000)});

                        if (regex.test(msg.content) === false) return message.channel.send(embeds.noValidLink()).then(x => {toSupp.push(x)});

                        try {
                            embed.setAuthor(embed.author.name, msg.content)
                            edit();
                            collector.stop();
                        } catch (error) {
                            message.channel.send(`:x: | Vous n'avez pas saisi de lien valide, veuillez en revoyer un ou tapez \`cancel\``).then(x => {toSupp.push(x)});
                        };
                    });
                    collector.on('end', async(c, r) => {
                        change();
                        toSupp.forEach(async(msg) => {
                            if (msg.deletable && !msg.deleted) await msg.delete().catch(() => {});
                        });
                        if (!c.size) return message.channel.send(embeds.collectorNoMessage()).then(x =>{setTimeout(() => {functions.del(x)}, 10000)});
                    });
                },
                footer_img: async() => {
                    const collector = message.channel.createMessageCollector((msg) => msg.author.id === message.author.id, {time: 120000});
                    var toSupp = [];
                    message.channel.send(new Discord.MessageEmbed().setFooter(`Tapez cancel pour annuler et vous avez deux minutes`)
                        .setTimestamp()
                        .setColor('ORANGE')
                        .setDescription(`❓ | Quel est le lien de l'image du pied-de-page ?`)
                        .setTitle("Image du pied-de-page")
                    ).then(async(x) => {toSupp.push(x)});

                    collector.on('collect', async(msg) => {
                        toSupp.push(msg);
                        if (msg.content.toLowerCase() === 'cancel') return collector.stop() & message.channel.send(new Discord.MessageEmbed()
                            .setTitle("Annulé")
                            .setTimestamp()
                            .setDescription(`✅ | Annulation de la modification de l'image du pied-de-page`)
                            .setColor("GREEN")
                        ).then(x => {setTimeout(() => {functions.del(x)}, 1000)});

                        if (regex.test(msg.content) === false) return message.channel.send(embeds.noValidLink()).then(x => {toSupp.push(x)});;

                        try {
                            embed.setFooter(embed.footer.text, msg.content)
                            edit();
                            collector.stop();
                        } catch (error) {
                            message.channel.send(`:x: | Vous n'avez pas saisi de lien valide, veuillez en revoyer un ou tapez \`cancel\``).then(x => {toSupp.push(x)});
                        };

                    });
                    collector.on('end', async(c, r) => {
                        change();
                        toSupp.forEach(async(msg) => {
                            if (msg.deletable && !msg.deleted) await msg.delete().catch(() => {});
                        });
                        if (!c.size) return message.channel.send(embeds.collectorNoMessage()).then(x =>{setTimeout(() => {functions.del(x)}, 10000)});
                    });
                },
                footer_text: async() => {
                    const collector = message.channel.createMessageCollector((msg) => msg.author.id === message.author.id, {time: 120000});
                    var toSupp = [];
                    message.channel.send(new Discord.MessageEmbed().setFooter(`Tapez cancel pour annuler et vous avez deux minutes`)
                        .setTimestamp()
                        .setTitle("Pied-de-page")
                        .setDescription(`❓ | Quel est le pied-de-page ?`)
                        .setColor('ORANGE')
                    ).then(async(x) => {toSupp.push(x)});

                    collector.on('collect', async(msg) => {
                        toSupp.push(msg);
                        if (msg.content.toLowerCase() === 'cancel') return collector.stop() & message.channel.send(new Discord.MessageEmbed()
                            .setTitle("Annulé")
                            .setTimestamp()
                            .setColor("GREEN")
                            .setDescription(`✅ | Annulation de la modification du pied-de-page`)
                        ).then(x => {setTimeout(() => {functions.del(x)}, 1000)});

                        embed.setFooter(msg.content);
                        edit();
                        collector.stop();
                    });
                    collector.on('end', async(c, r) => {
                        change();
                        toSupp.forEach(async(msg) => {
                            if (msg.deletable && !msg.deleted) await msg.delete().catch(() => {});
                        });
                        if (!c.size) return message.channel.send(embeds.collectorNoMessage()).then(x =>{setTimeout(() => {functions.del(x)}, 10000)});
                    });
                },
                field: async() => {
                    const collector = message.channel.createMessageCollector((msg) => msg.author.id === message.author.id, {time: 120000});
                    var toSupp = [];
                    message.channel.send(new Discord.MessageEmbed()
                        .setFooter(`Tapez cancel pour annuler et vous avez deux minutes`)
                        .setTimestamp()
                        .setTitle("Champs de texte")
                        .setDescription(`ℹ | Donnez trois valeurs : le titre, le texte et si il est "inline" (oui ou non) séparés par \`--\`.\nExemples: le titre du champs --Ceci est la description --non\nLien --cliquez ici --oui`)
                        .setColor('ORANGE')
                    ).then(async(x) => {toSupp.push(x)});

                    collector.on('collect', async(msg) => {
                        toSupp.push(msg);
                        if (msg.content.toLowerCase() === 'cancel') return collector.stop() & message.channel.send(new Discord.MessageEmbed()
                            .setTitle("Annulé")
                            .setTimestamp()
                            .setDescription(`:white_check_mark: | Annulation de la création du champs de texte`)
                            .setColor("GREEN")
                        ).then(x => {setTimeout(() => {functions.del(x)}, 1000)});

                        const infos = msg.content.split(/--/g);
                        if (infos.length !== 3) return message.channel.send(`:x: | Vous n'avez pas saisi toutes les valeurs (ou elles ne sont pas séparées par \`--\`)`).then(x => {toSupp.push(x)});
                        
                        const title = infos.shift();
                        const description = infos.shift();
                        const inline = infos[0].toLowerCase() === 'oui' ? true : false;

                        embed.addField(title, description, inline);
                        edit();
                        collector.stop();
                    });
                    collector.on('end', async(c, r) => {
                        change();
                        toSupp.forEach(async(msg) => {
                            if (msg.deletable && !msg.deleted) await msg.delete().catch(() => {});
                        });
                        if (!c.size) return message.channel.send(embeds.collectorNoMessage()).then(x =>{setTimeout(() => {functions.del(x)}, 10000)});
                    });
                },
                img: async() => {
                    const collector = message.channel.createMessageCollector((msg) => msg.author.id === message.author.id, {time: 120000});
                    var toSupp = [];
                    message.channel.send(new Discord.MessageEmbed().setFooter(`Tapez cancel pour annuler et vous avez deux minutes`)
                        .setTimestamp()
                        .setDescription(`❓ | Quelle est l'image de l'embed ?\nRépondez par **un lien**`)
                        .setTitle("Image")
                        .setColor('ORANGE')
                    ).then(async(x) => {toSupp.push(x)});

                    collector.on('collect', async(msg) => {
                        toSupp.push(msg);
                        if (msg.content.toLowerCase() === 'cancel') return collector.stop() & message.channel.send(new Discord.MessageEmbed()
                            .setTitle("Annulé")
                            .setDescription(`:white_check_mark: | Annulation de la modification de l'image`)
                            .setTimestamp()
                            .setColor("GREEN")
                        ).then(x => {setTimeout(() => {functions.del(x)}, 1000)});

                        if (regex.test(msg.content) === false) return message.channel.send(embeds.noValidLink()).then(x => {toSupp.push(x)});;

                        try {
                            embed.setImage(msg.content);
                            edit();
                            collector.stop();
                        } catch (error) {
                            message.channel.send(`:x: | Vous n'avez pas saisi de lien valide, veuillez en revoyer un ou tapez \`cancel\``).then(x => {toSupp.push(x)});
                        };
                    });
                    collector.on('end', async(c, r) => {
                        change();
                        toSupp.forEach(async(msg) => {
                            if (msg.deletable && !msg.deleted) await msg.delete().catch(() => {});
                        });
                        if (!c.size) return message.channel.send(embeds.collectorNoMessage()).then(x =>{setTimeout(() => {functions.del(x)}, 10000)});
                    });
                },
                url: async() => {
                    const collector = message.channel.createMessageCollector((msg) => msg.author.id === message.author.id, {time: 120000});
                    var toSupp = [];
                    message.channel.send(new Discord.MessageEmbed().setFooter(`Tapez cancel pour annuler et vous avez deux minutes`)
                        .setTimestamp()
                        .setTitle("URL")
                        .setDescription("❓ | Quel est le lien qui apparaitra sur le titre de l'embed ?")
                        .setColor('ORANGE')
                    ).then(async(x) => {toSupp.push(x)});

                    collector.on('collect', async(msg) => {
                        toSupp.push(msg);
                        if (msg.content.toLowerCase() === 'cancel') return collector.stop() & message.channel.send(new Discord.MessageEmbed()
                            .setTitle("Annulé")
                            .setTimestamp()
                            .setDescription(`:white_check_mark: | Annulation de la modification de l'url`)
                            .setColor("GREEN")
                        ).then(x => {setTimeout(() => {functions.del(x)}, 1000)});

                        if (regex.test(msg.content) === false) return message.channel.send(embeds.noValidLink()).then(x => {toSupp.push(x)});;

                        try {
                            embed.setURL(msg.content)
                            edit();
                            collector.stop();
                        } catch (error) {
                            message.channel.send(`:x: | Vous n'avez pas saisi de lien valide, veuillez en revoyer un ou tapez \`cancel\``).then(x => {toSupp.push(x)});
                        };
                    });
                    collector.on('end', async(c, r) => {
                        change();
                        toSupp.forEach(async(msg) => {
                            if (msg.deletable && !msg.deleted) await msg.delete().catch(() => {});
                        });
                        if (!c.size) return message.channel.send(embeds.collectorNoMessage()).then(x =>{setTimeout(() => {functions.del(x)}, 10000)});
                    });
                },
                timestamp: () => {
                    embed.setTimestamp();
                    edit();
                },
                thumbnail: async() => {
                    const collector = message.channel.createMessageCollector((msg) => msg.author.id === message.author.id, {time: 120000});
                    var toSupp = [];
                    message.channel.send(new Discord.MessageEmbed().setFooter(`Tapez cancel pour annuler et vous avez deux minutes`)
                        .setTimestamp()
                        .setTitle("Thumbnail")
                        .setDescription(`❓ | Quel est le thumbnail de l'embed ?\nRépondez par **un lien**`)
                        .setAuthor("Désolé je ne connais pas la traduction de thumbnail 😅")
                        .setColor('ORANGE')
                        .setThumbnail(message.author.avatarURL({dynamic: true}))
                    ).then(async(x) => {toSupp.push(x)});

                    collector.on('collect', async(msg) => {
                        toSupp.push(msg);
                        if (msg.content.toLowerCase() === 'cancel') return collector.stop() & message.channel.send(new Discord.MessageEmbed()
                            .setTitle("Annulé")
                            .setTimestamp()
                            .setDescription(`✅ | Annulation de la modification du thumbnail (je ne connais toujours pas la traduction)`)
                            .setColor("GREEN")
                        ).then(x => {setTimeout(() => {functions.del(x)}, 1000)});

                        if (regex.test(msg.content) === false) return message.channel.send(embeds.noValidLink()).then(x => {toSupp.push(x)});;

                        try {
                            embed.setThumbnail(msg.content)
                            edit();
                            collector.stop();
                        } catch (error) {
                            message.channel.send(`Vous n'avez pas saisi de lien valide, veuillez en revoyer un ou tapez \`cancel\``).then(x => {toSupp.push(x)});
                        };
                    });
                    collector.on('end', async(c, r) => {
                        change();
                        toSupp.forEach(async(msg) => {
                            if (msg.deletable && !msg.deleted) await msg.delete().catch(() => {});
                        });
                        if (!c.size) return message.channel.send(embeds.collectorNoMessage()).then(x =>{setTimeout(() => {functions.del(x)}, 10000)});
                    });
                },
                send: async() => {
                    const collector = message.channel.createMessageCollector((msg) => msg.author.id === message.author.id, {time: 120000});
                    var toSupp = [];
                    message.channel.send(new Discord.MessageEmbed().setFooter(`Tapez cancel pour annuler et vous avez deux minutes`)
                        .setTimestamp()
                        .setColor('ORANGE')
                        .setTitle("Envoi")
                        .setDescription(`Dans quel salon l'embed doit-il être envoyé ?`)
                    ).then(async(x) => {toSupp.push(x)});

                    collector.on('collect', async(msg) => {
                        toSupp.push(msg);
                        if (msg.content.toLowerCase() === 'cancel') return collector.stop() & message.channel.send(new Discord.MessageEmbed()
                            .setTitle("Annulé")
                            .setTimestamp()
                            .setDescription(`Annulation de l'envoi de l'embed`)
                            .setColor("GREEN")
                        ).then(x => {setTimeout(() => {functions.del(x)}, 1000)});

                        if (!msg.mentions.channels.size) return message.channel.send(new Discord.MessageEmbed()
                            .setTitle(":x: Pas de mention")
                            .setDescription(`:x: | Vous n'avez pas mentionné de salon. Veuillez réessayer la commande :white_check_mark:`)
                            .setTimestamp()
                            .setFooter(`Tapez cancel pour annuler`)
                            .setColor('RED')
                        ).then(async(x) => {
                            toSupp.push(x);
                        });

                        msg.mentions.channels.first().send(embed);
                        envoyed = true;
                        collector.stop();
                    });
                    collector.on('end', async(c, r) => {
                        change();
                        toSupp.forEach(async(msg) => {
                            if (msg.deletable && !msg.deleted) await msg.delete().catch(() => {});
                        });
                        if (!c.size) return message.channel.send(embeds.collectorNoMessage()).then(x =>{setTimeout(() => {functions.del(x)}, 10000)});
                    });
                },
                cancel: () => {
                    menu.delete();
                    embedMSG.delete();
                    message.channel.send(embeds.canceled());
                }
            };

            bigCollector.on('collect', async(r, u) => {
                if (encours === true) return message.channel.send(new Discord.MessageEmbed()
                    .setTitle(":x: Une autre action est déjà en cours")
                    .setDescription(`:x: | Une autre acion est déjà en cours.\nTerminez cette action avant d'en recommencer une.\nTapez \`cancel\` pour annuler l'action`)
                )

                const element = reactionsArray.filter(x => x.emoji === r.emoji.name)[0];
                fnts[element.fnt]();
                if (r.emoji.name === '✅') {
                    if (envoyed === true) {
                        bigCollector.stop();
                    }
                };
            });
            bigCollector.on('end', async(c, r) => {
                menu.delete();
                embedMSG.delete();

                if (!c.size) message.channel.send(new Discord.MessageEmbed()
                    .setTitle(":x: Aucune réaction")
                    .setDescription(`:x: | Vous n'avez pas réagi`)
                    .setFooter(message.author.username, message.author.avatarURL({dynamic: true}))
                );
            });
        });
    });
};

module.exports.help = {
    name: "embed",
    description: "Embed builder by reacting"
}
