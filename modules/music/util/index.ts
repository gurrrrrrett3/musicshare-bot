import { Colors, EmbedBuilder } from "discord.js";

export default class Util {
    public static formatDuration(duration: number): string {
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }

    public static errorEmbed(message: string): {
        embeds: EmbedBuilder[]
    } {
        const embed = new EmbedBuilder()
            .setTitle("Whoops!")
            .setDescription(message)
            .setColor(Colors.Red);

        return {
            embeds: [embed]
        }
    }
}
