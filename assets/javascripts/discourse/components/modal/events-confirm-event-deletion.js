/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { action, computed } from "@ember/object";
import { i18n } from "discourse-i18n";
import Event from "../../models/event";

const DELETE_TARGETS = ["events_only", "events_and_topics", "topics_only"];

export default class EventsConfirmEventDeletion extends Component {
  deleteTargets = DELETE_TARGETS.map((t) => ({
    id: t,
    name: i18n(`admin.events.event.delete.${t}`),
  }));
  deleteTarget = "events_only";

  @computed("deleteTarget")
  get btnLabel() {
    return `admin.events.event.delete.${this.deleteTarget}_btn`;
  }

  @action
  delete() {
    const eventIds = this.model.eventIds;
    const target = this.deleteTarget;

    const opts = {
      event_ids: eventIds,
      target,
    };

    this.set("destroying", true);

    Event.destroy(opts)
      .then((result) => {
        if (result.success) {
          this.model.onDestroyEvents(
            eventIds.filter((eventId) =>
              result.destroyed_event_ids.includes(eventId)
            ),
            eventIds.filter((eventId) =>
              result.destroyed_topics_event_ids.includes(eventId)
            )
          );
          this.closeModal();
        } else {
          this.set("model.error", result.error);
        }
      })
      .finally(() => this.set("destroying", false));
  }

  @action
  cancel() {
    this.closeModal();
  }
}
