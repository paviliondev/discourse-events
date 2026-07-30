/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { computed } from "@ember/object";
import { classNameBindings } from "@ember-decorators/component";
import { i18n } from "discourse-i18n";

const icons = {
  error: "times-circle",
  success: "check-circle",
  warn: "exclamation-circle",
  info: "circle-info",
};

const DOCUMENTATION_URL = "https://github.com/angusmcleod/discourse-events";

@classNameBindings(":events-message", "message.type", "loading")
export default class EventsMessage extends Component {
  @computed("loading")
  get showDocumentation() {
    return !this.loading;
  }

  @computed("loading")
  get showIcon() {
    return !this.loading;
  }

  @computed("items.[]")
  get hasItems() {
    return Boolean(this.items?.length);
  }

  @computed("message.type")
  get icon() {
    return icons[this.message?.type] || "circle-info";
  }

  @computed("message.key", "viewName", "message.opts")
  get text() {
    return i18n(
      `admin.events.message.${this.viewName}.${this.message?.key}`,
      this.message?.opts || {}
    );
  }

  get documentation() {
    return i18n("admin.events.message.documentation");
  }

  get documentationUrl() {
    return DOCUMENTATION_URL;
  }
}
