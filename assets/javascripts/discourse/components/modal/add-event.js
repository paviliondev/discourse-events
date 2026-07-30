/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
import { tracked } from "@glimmer/tracking";
import Component from "@ember/component";
import { action } from "@ember/object";
import { i18n } from "discourse-i18n";

export default class AddEvent extends Component {
  @tracked bufferedEvent = this.model.event;
  title = i18n("add_event.modal_title");
  valid = true;

  @action
  clear() {
    event?.preventDefault();
    this.bufferedEvent = null;
  }

  @action
  saveEvent() {
    if (this.valid) {
      this.get("model.update")(this.bufferedEvent);
      this.closeModal();
    } else {
      this.flash = i18n("add_event.error");
    }
  }

  @action
  updateEvent(event, valid) {
    this.bufferedEvent = event;
    this.valid = valid;
  }
}
