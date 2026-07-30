import EmberObject from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default class Event extends EmberObject {
  static list(data = {}) {
    return ajax("/admin/plugins/events/event", {
      type: "GET",
      data,
    }).catch(popupAjaxError);
  }

  static listAll(data = {}) {
    return ajax("/admin/plugins/events/event/all", {
      type: "GET",
      data,
    }).catch(popupAjaxError);
  }

  static destroy(data) {
    return ajax("/admin/plugins/events/event", {
      type: "DELETE",
      data,
    }).catch(popupAjaxError);
  }

  static connectTopic(data) {
    return ajax("/admin/plugins/events/event/topic/connect", {
      type: "POST",
      data,
    }).catch(popupAjaxError);
  }

  static updateTopic(data) {
    return ajax("/admin/plugins/events/event/topic/update", {
      type: "POST",
      data,
    }).catch(popupAjaxError);
  }

  static toArray(events, selectedEventIds = []) {
    return events.map((event) => {
      if (selectedEventIds.includes(event.id)) {
        event.selected = true;
      }
      return Event.create(event);
    });
  }

  selected = false;
}
