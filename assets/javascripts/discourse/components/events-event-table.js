/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { action, computed } from "@ember/object";
import { classNames } from "@ember-decorators/component";
import Event from "../models/event";

@classNames("events-event-table")
export default class EventsEventTable extends Component {
  loadingComplete = false;

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
}
