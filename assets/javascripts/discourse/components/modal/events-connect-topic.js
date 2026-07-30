/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { action, computed } from "@ember/object";
import { service } from "@ember/service";
import Event from "../../models/event";

export default class EventsConnectTopic extends Component {
  @service siteSettings;

  createTopic = false;

  @computed("connecting", "topicId", "createTopic", "client")
  get connectDisabled() {
    return (
      this.connecting || (!this.topicId && !this.createTopic) || !this.client
    );
  }

  @computed(
    "siteSettings.calendar_enabled",
    "siteSettings.discourse_post_event_enabled"
  )
  get allowedClientValues() {
    const allowedClients = ["discourse_events"];
    if (
      this.siteSettings.calendar_enabled &&
      this.siteSettings.discourse_post_event_enabled
    ) {
      allowedClients.push("discourse_calendar");
    }
    return allowedClients;
  }

  @action
  connectTopic() {
    if (this.connectDisabled) {
      return;
    }

    const opts = {
      event_id: this.model.event.id,
      client: this.client,
    };

    if (this.topicId) {
      opts.topic_id = this.topicId;
    }

    if (this.createTopic) {
      opts.category_id = this.category_id;
      opts.username = this.username;
    }

    this.set("connecting", true);

    Event.connectTopic(opts)
      .then((result) => {
        if (result?.success) {
          this.model.onConnectTopic();
          this.closeModal();
        } else {
          this.set("model.error", result.error);
        }
      })
      .finally(() => this.set("connecting", false));
  }

  @action
  cancel() {
    this.closeModal();
  }
}
