import { ButtonInteraction, ModalSubmitInteraction, SelectMenuInteraction } from "discord.js";
import { bot } from "../index.js";

export default class InteractionHandler {
  constructor(
    type: InteractionType.BUTTON,
    id: string,
    execute: (interaction: ButtonInteraction) => any,
    module?: string
  );
  constructor(
    type: InteractionType.MODAL,
    id: string,
    execute: (interaction: ModalSubmitInteraction) => any,
    module?: string
  );
  constructor(
    type: InteractionType.SELECT_MENU,
    id: string,
    execute: (interaction: SelectMenuInteraction) => any,
    module?: string
  );
  constructor(
    public type: InteractionType,
    public id: string,
    public execute: (interaction: any) => any,
    public module?: string
  ) {
    switch (type) {
      case InteractionType.BUTTON:
        bot.buttonManager.registerButton(id, execute);
        break;
      case InteractionType.MODAL:
        bot.modalManager.registerModal(id, execute);
        break;
      case InteractionType.SELECT_MENU:
        bot.selectMenuManager.registerMenu(id, execute);
        break;
      default:
        throw new Error(`Invalid interaction type: ${type}`);
    }
  }

}

export enum InteractionType {
  BUTTON = 1,
  MODAL = 2,
  SELECT_MENU = 3,
}
