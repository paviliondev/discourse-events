/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { action, computed } from "@ember/object";
import { classNameBindings, tagName } from "@ember-decorators/component";
import { observes } from "discourse/lib/decorators";
import { i18n } from "discourse-i18n";

@tagName("div")
@classNameBindings(
  ":directory-table__row",
  ":events-event-row",
  "event.selected:selected"
)
export default class EventsEventRow extends Component {
  @observes("event.selected")
  selectEvent() {
    this.modifySelection([this.event.id], this.event.selected);
  }

  @computed("event.provider_id", "providers")
  get provider() {
    return this.providers.find(
      (provider) => provider.id === this.event.provider_id
    );
  }

  click() {
    this.set("event.selected", !this.get("event.selected"));
  }

  @action
  openTopic(topicId) {
    event?.preventDefault();
    event?.stopPropagation();
    window.open(`/t/${topicId}`, "_blank");
  }

  @computed("provider.provider_type")
  get providerLabel() {
    if (this.provider?.provider_type) {
      return i18n(
        `admin.events.provider.provider_type.${this.provider.provider_type}.label`
      );
    } else {
      return null;
    }
  }
}
