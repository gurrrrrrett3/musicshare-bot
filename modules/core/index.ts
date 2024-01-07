import { bot } from "../../core/index.js";
import Module from "../../core/base/module.js";

export default class CoreModule extends Module {
name = "core";
description = "The core commands for onebot";

    getCoreModule(): CoreModule {
        return bot.moduleLoader.getModule("core") as CoreModule;
    }

}