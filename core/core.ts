import { Client } from "discord.js";
import Bot from "./bot.js";
import ModuleLoader from "./loaders/moduleLoader.js";
import GlobalLogger, { Logger } from "./utils/logger.js";

export default class Core {
  public Client: Client;
  public bot: Bot;

  private _discordLogger = new Logger("Discord");

  constructor(private _options: Core.OnebotOptions) {
    // @TODO manage options

    const intents = ModuleLoader.getIntents();
    this.Client = new Client({ intents });
    this.bot = new Bot(this.Client);

    this.Client.setMaxListeners(0);
    this.Client.login(this._options.token);

    if (this._options.debug) {
      GlobalLogger.init({
        debugEnabled: true,
      })
    }

    if (this._options.discordDebug) {
      this.Client.on("debug", (info) => {
        this._discordLogger.debug("Discord", info);
      });

      this.Client.on("warn", (info) => {
        this._discordLogger.debug("Discord", info);
      })
    }

  }
}
