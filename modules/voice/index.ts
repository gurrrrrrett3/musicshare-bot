import { bot } from "../../core/index.js";
import Module from "../../core/base/module.js";

export default class VoiceModule extends Module {
    name = "voice";
    description = "The voice commands for onebot";

    getVoiceModule(): VoiceModule {
        return bot.moduleLoader.getModule("voice") as VoiceModule;
    }

    async onLoad(): Promise<boolean> {

        return true;
    }
}
