/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { classNames } from "@ember-decorators/component";
import { i18n } from "discourse-i18n";
import EventRsvpModel, { rsvpTypes } from "../models/event-rsvp";
import EventRsvpModal from "./modal/event-rsvp";

@classNames("event-rsvp")
export default class EventRsvp extends Component {
  @service modal;
  @service currentUser;

  updatingRsvp = false;

  @action
  updateRsvp(type) {
    this.set("updatingRsvp", true);

    const data = {
      type,
      username: this.currentUser.username,
      topic_id: this.get("topic.id"),
    };
    EventRsvpModel.save(data).then(() => {
      this.setProperties({
        updatingRsvp: false,
        "topic.event_user": {
          rsvp: type,
        },
      });
    });
  }

  get rsvpOptions() {
    return rsvpTypes.map((rsvpType) => {
      return {
        id: rsvpType,
        name: i18n(`event_rsvp.${rsvpType}.user_label`),
      };
    });
  }

  @action
  openModal() {
    event?.preventDefault();
    this.modal.show(EventRsvpModal, {
      model: {
        topic: this.get("topic"),
      },
    });
  }
}
