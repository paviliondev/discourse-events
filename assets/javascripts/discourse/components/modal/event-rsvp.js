/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { action, computed } from "@ember/object";
import { getOwner } from "@ember/owner";
import User from "discourse/models/user";
import { i18n } from "discourse-i18n";
import EventRsvp, { rsvpTypes } from "../../models/event-rsvp";

export default class EventRsvpModal extends Component {
  userList = [];
  type = "going";
  title = i18n("event_rsvp.attendees.title");
  rsvpTypes = rsvpTypes;

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    this.setUserList();
  }

  @action
  setUserList() {
    this.set("loadingList", true);

    const type = this.get("type");
    const topic = this.get("model.topic");
    const data = {
      type,
      topic_id: topic.id,
    };
    EventRsvp.list(data).then((response) => {
      let userList = response.users || [];

      this.setProperties({
        userList,
        loadingList: false,
      });
    });
  }

  @action
  navClass(type) {
    return type === this.get("type") ? "active" : "";
  }

  @computed("userList.[]")
  get filteredList() {
    const userList = [...this.userList];
    const currentUser = this.get("currentUser");
    if (currentUser) {
      userList.sort((a) => {
        if (a.username === currentUser.username) {
          return -1;
        } else {
          return 1;
        }
      });
    }
    return userList;
  }

  @action
  setType(type) {
    event?.preventDefault();
    this.set("type", type);
    this.setUserList();
  }

  @action
  composePrivateMessage(user) {
    const controller = getOwner(this).lookup("controller:application");
    this.closeModal();
    controller.send("composePrivateMessage", User.create(user));
  }
}
