import { bot } from "../../core/index.js";
import Module from "../../core/base/module.js";
import fs from "fs";
import path from "path";
import Processor from "./classes/processor.js";
import Logger from "../../core/utils/logger.js";
import { RequiredSongData } from "./classes/song.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Colors, EmbedBuilder, Message } from "discord.js";
import { SpotifySongData } from "./processors/spotifyProcessor.js";
import YoutubeProcessor, { YoutubeSongData } from "./processors/youtubeProcessor.js";
import chalk from "chalk";

export default class MusicModule extends Module {
    name = "music";
    description = "The music commands for onebot";

    public processors: Processor<any>[] = [];

    getMusicModule(): MusicModule {
        return bot.moduleLoader.getModule("music") as MusicModule;
    }

    public override async onLoad(): Promise<boolean> {
        await this.loadProcessors();

        bot.client.on('messageCreate', async (message) => {

            if (message.author.bot) return;

            const url = message.content.match(/(https?:\/\/[^\s]+)/)?.[1];
            if (!url) return;



            this.lookupSong("message", url, message);

        })

        return true;
    }

    public async lookupSong(mode: "message", url: string, message: Message): Promise<void>;
    public async lookupSong(mode: "interaction", url: string, interaction: ChatInputCommandInteraction): Promise<void>;
    public async lookupSong(mode: string, url: string, message: Message | ChatInputCommandInteraction): Promise<void> {

        let processor = this.processors.find((processor) => processor.shouldProcess(url)) as Processor<RequiredSongData>;
        if (!processor) return;

        if (mode == "message" && processor.name === 'Youtube' && !(message as Message).content.startsWith('-')) return;

        let song = await processor.getUrlInfo(url).catch((err) => {
            processor.error(err.message);
            return undefined;
        });

        if (!song) return;

        const loadingEmbed = new EmbedBuilder()
            .setAuthor({
                name: song.artist,
            })
            .setTitle(song.name)
            .setColor(Colors.Yellow)
            .setDescription('Loading song information...')

        const msg = mode === 'message' ? (message as Message).channel.send({
            embeds: [loadingEmbed]
        }) : (message as ChatInputCommandInteraction).reply({
            embeds: [loadingEmbed]
        });

        const otherProcessors = this.processors.filter((p) => p.name !== processor.name);
        const searchString = `${song.name} ${song.artist}`;

        const songInfo = await Promise.all(otherProcessors.map(async (processor: Processor<RequiredSongData>) => {
            let songs = await processor.search(searchString).catch((err) => {
                processor.error(err.message);
                console.log(err);
                return [{
                    error: true,
                    message: err.message,
                    processor: processor.name
                }]
            });

            processor.debug(`Found ${songs.length} results for ${searchString}`)
            return {
                processor: processor.name,
                song: {
                    ...songs[0],
                    error: false,
                },
            }
        })).then((songInfo) => {
            const songInfoObject: Record<string, RequiredSongData & { error?: boolean, message?: string }> = {};
            for (const { processor, song } of songInfo) {
                // @ts-ignore
                songInfoObject[processor] = song.error ? song.message : song;
            }
            return songInfoObject;
        });

        songInfo[processor.name] = song;

        // check specific processors for special information

        const artistIcon = (songInfo['Youtube'] as YoutubeSongData)?.artistImageUrl;
        const albumIcon = (songInfo['Spotify'] as SpotifySongData)?.albumImageUrl || (songInfo['Youtube'] as YoutubeSongData)?.albumImageUrl;
        const descriptionTable = songInfo['Spotify'] ? this.buildAnsiDescriptionTable(songInfo['Spotify'] as SpotifySongData) : '';
        const duration = Math.round(songInfo['Spotify']?.duration / 1000) || songInfo['Youtube']?.duration || 0;
        const generes = (songInfo['Spotify'] as SpotifySongData)?.generes || [];

        const generesString = generes.length > 0 ? generes.join(', ') : '';
        const durationString = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;

        const embed = new EmbedBuilder()
            .setAuthor({
                name: song.artist,
                iconURL: artistIcon
            })
            .setTitle(`${song.name}`)
            .setColor(Colors.Green)
            .setTimestamp()

        if (albumIcon) embed.setThumbnail(albumIcon);

        let description = '';

        for (const [processor, song] of Object.entries(songInfo)) {
            if (song.error || song.message) {
                description += `**${processor}**: ${song.message}\n`;
            } else if (!song.url) {
                description += `**${processor}**: No results found\n`;
            } else {
                description += `[${processor}](${song.url})\n`
            }
        }

        description += `\n${descriptionTable}`

        embed.setDescription(description);

        if (generesString != '') embed.addFields({
            name: 'Generes',
            value: generesString,
            inline: true
        });

        embed.addFields({
            name: 'Duration',
            value: durationString,
            inline: true
        });

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Remove Embed')
                    .setEmoji('🗑️')
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId('Remove Embed')
                    .setCustomId(`${message.id}-remove`)
            )

        bot.buttonManager.registerButton(`${message.id}-remove`, async (interaction) => {
            if (mode === 'message') {
                await (await msg).delete();
            } else {
                await (message as ChatInputCommandInteraction).deleteReply();
            }

            interaction.reply({
                content: 'Removed embed.',
                ephemeral: true
            })
        })

        mode === 'message' ? (await msg).edit({
            embeds: [embed],
            components: [row]
        }) : (message as ChatInputCommandInteraction).editReply({
            embeds: [embed],
            components: [row]
        });
    }

    public async loadProcessors() {
        let processorPath = path.resolve(`./dist/modules/${this.name}/processors`);
        let processorFiles = fs.readdirSync(processorPath).filter((file) => file.endsWith('.js'));

        for (let processorFile of processorFiles) {
            let processorImport = await import(`${processorPath}/${processorFile}`);
            const processor = new processorImport.default() as Processor<any>;
            if (!processor.enabled) continue;

            this.processors.push(processor);

            Logger.info(processor.name, 'Loaded processor');
        }

    }

    public getColorFunction(number: number) {
        if (number < 33) return chalk.blue;
        if (number < 66) return chalk.white;
        return chalk.red;
    }

    public buildTableRow(title: string, value: number, endValue: string, length: number = 12) {
        let tableRow = '\n';

        const numberColor = this.getColorFunction(value);

        tableRow += chalk.reset(
            chalk.greenBright(title.padEnd(length, ' ')),
            numberColor(value.toFixed(1).padStart(5, ' ')),
            chalk.grey(endValue)
        )

        return tableRow;
    }

    public buildAnsiDescriptionTable(spotifyData: SpotifySongData) {
        let table = '```ansi\n'

        // table += chalk.white.bold('Features') + '\n';
        table += "-".repeat(15) + '\n';

        // table += this.buildTableRow('Acousticness', spotifyData.acousticness * 100, '%');
        // table += this.buildTableRow('Danceability', spotifyData.danceability * 100, '%');
        // table += this.buildTableRow('Energy', spotifyData.energy * 100, '%');
        // table += this.buildTableRow('Instrumentalness', spotifyData.instrumentalness * 100, '%');
        // table += '\n';
        table += this.buildTableRow('Tempo', spotifyData.tempo, 'BPM');
        table += this.buildTableRow('Loudness', spotifyData.loudness, 'dB');
        table += this.buildTableRow('Popularity', spotifyData.popularity, '%');

        table += '```';

        return table;
    }

    public static getMusicModule(): MusicModule {
        return bot.moduleLoader.getModule("music") as MusicModule;
    }

}
