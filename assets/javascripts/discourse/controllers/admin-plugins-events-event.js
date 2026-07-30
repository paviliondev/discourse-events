/* eslint-disable discourse/no-computed-macros, ember/no-mixins */
import Controller from "@ember/controller";
import { action, computed } from "@ember/object";
import { notEmpty } from "@ember/object/computed";
import { service } from "@ember/service";
import { autoTrackedArray } from "discourse/lib/tracked-tools";
import { i18n } from "discourse-i18n";
import ConfirmEventDeletion from "../components/modal/events-confirm-event-deletion";
import ConnectTopic from "../components/modal/events-connect-topic";
import Message from "../mixins/message";
import Event from "../models/event";

export default class AdminPluginsEventsEvent extends Controller.extend(
  Message
) {
  @service modal;

  @notEmpty("events") hasEvents;
  @autoTrackedArray events;
  @autoTrackedArray selectedEventIds = [];

  selectAll = false;
  order = "";
  asc = null;
  filter = null;
  queryParams = ["filter", "order", "asc"];

  loadingComplete = false;
  loading = false;

  @computed("selectedEventIds.[]", "hasEvents")
  get deleteDisabled() {
    return !this.hasEvents || !this.selectedEventIds?.length;
  }

  @computed("hasEvents")
  get selectDisabled() {
    return !this.hasEvents;
  }

  @computed("filter")
  get noneLabel() {
    return i18n(
      `admin.events.event.none.${
        this.filter === "connected" ? "connected" : "unconnected"
      }`
    );
  }

  @computed("filter")
  get unconnectedRoute() {
    return this.filter === "unconnected";
  }

  @computed("filter")
  get connectedRoute() {
    return this.filter === "connected";
  }

  @computed("filter")
  get viewName() {
    return `event.${this.filter}`;
  }

  @computed("selectedEventIds.[]")
  get connectTopicDisabled() {
    return this.selectedEventIds?.length !== 1;
  }

  @computed("selectedEventIds.[]")
  get updateTopicDisabled() {
    return this.selectedEventIds?.length !== 1;
  }

  updateCurrentRouteCount() {
    const events = this.get("events");
    this.set(
      `${this.unconnectedRoute ? "without" : "with"}TopicsCount`,
      events.length
    );
  }

  @computed("filter")
  get showTopics() {
    return this.filter === "connected";
  }

  selectAllEvents() {
    Event.listAll({ filter: this.filter }).then((result) => {
      this.modifySelection(result.event_ids, true);
    });
  }

  @action
  toggleSelectAll() {
    this.toggleProperty("selectAll");

    if (this.selectAll) {
      this.selectAllEvents();
    } else {
      this.modifySelection(this.selectedEventIds, false);
    }
  }

  @action
  loadMore() {
    if (this.loading || this.loadingComplete) {
      return;
    }

    const page = this.page + 1;
    let params = {
      page,
    };
    if (this.filter) {
      params.filter = this.filter;
    }
    if (this.asc) {
      params.asc = this.asc;
    }
    if (this.order) {
      params.order = this.order;
    }

    this.set("loading", true);

    Event.list(params)
      .then((result) => {
        if (result.events && result.events.length) {
          this.set("page", page);
          this.events.push(
            ...Event.toArray(result.events, this.selectedEventIds)
          );
        } else {
          this.set("loadingComplete", true);
        }
      })
      .finally(() => this.set("loading", false));
  }

  @action
  openConnectTopic() {
    const selectedEventId = this.selectedEventIds[0];
    const event = this.events.find((item) => item.id === selectedEventId);

    if (!event) {
      return;
    }

    this.modal.show(ConnectTopic, {
      model: {
        event,
        onConnectTopic: () => {
          this.selectedEventIds = [];
          this.events = this.events.filter((item) => item !== event);
        },
      },
    });
  }

  @action
  updateTopic() {
    const selectedEventId = this.selectedEventIds[0];
    const event = this.events.find((item) => item.id === selectedEventId);

    if (!event) {
      return;
    }

    this.set("updating", true);

    Event.updateTopic({ event_id: event.id })
      .then((result) => {
        if (result.success) {
          this.selectedEventIds = [];
        }
      })
      .finally(() => this.set("updating", false));
  }

  @action
  modifySelection(eventIds, selected) {
    this.get("events").forEach((event) => {
      if (eventIds.includes(event.id)) {
        event.set("selected", selected);
      }
    });
    if (selected) {
      this.selectedEventIds = [
        ...new Set([...this.selectedEventIds, ...eventIds]),
      ];
    } else {
      this.selectedEventIds = this.selectedEventIds.filter(
        (eventId) => !eventIds.includes(eventId)
      );
    }
  }

  @action
  openDelete() {
    this.modal.show(ConfirmEventDeletion, {
      model: {
        eventIds: this.selectedEventIds,
        onDestroyEvents: (
          destroyedEventIds = null,
          destroyedTopicsEvents = null
        ) => {
          this.selectedEventIds = [];

          const events = this.events;

          if (destroyedEventIds) {
            this.events = events.filter(
              (event) => !destroyedEventIds.includes(event.id)
            );
            this.updateCurrentRouteCount();
          }

          if (destroyedTopicsEvents) {
            const destroyedTopicsEventIds = destroyedTopicsEvents.map(
              (e) => e.id
            );

            events.forEach((event) => {
              if (destroyedTopicsEventIds.includes(event.id)) {
                event.set("topics", null);
              }
            });
          }
        },
      },
    });
  }

  @action
  updateOrder(field, asc) {
    this.setProperties({
      order: field,
      asc,
    });
  }
}
