import { bot } from "../../core/index.js";
import Module from "../../core/base/module.js";
import { ActivityType } from "discord.js";

export default class CoreModule extends Module {
    name = "core";
    description = "The core commands for onebot";

    getCoreModule(): CoreModule {
        return bot.moduleLoader.getModule("core") as CoreModule;
    }

    async onLoad(): Promise<boolean> {

        setInterval(() => {
            this.updateStatus();
        }, 300000); // 5 minutes

        this.updateStatus();

        return true;
    }

    public async updateStatus(): Promise<void> {

        const guildCount = bot.client.guilds.cache.size;
        const userCount = bot.client.users.cache.size;

        bot.client.user!.setActivity({
            type: ActivityType.Watching,
            name: `${guildCount} servers | ${userCount} users`
        });

    }
}
