import { action, computed } from "@ember/object";
import { classNames } from "@ember-decorators/component";
import getURL from "discourse/lib/get-url";
import Category from "discourse/models/category";
import DropdownSelectBoxComponent from "discourse/select-kit/components/dropdown-select-box";
import { i18n } from "discourse-i18n";

@classNames("events-calendar-subscription")
export default class EventsCalendarSubscription extends DropdownSelectBoxComponent {
  modifyComponentForRow() {
    return "events-calendar-subscription-row";
  }

  getDomain() {
    return location.hostname + (location.port ? ":" + location.port : "");
  }

  @computed("category")
  get content() {
    const path = this.category ? `/c/${Category.slugFor(this.category)}/l` : "";
    const url = this.getDomain() + getURL(path);
    const timeZone = moment.tz.guess();
    return [
      {
        id: `webcal://${url}/calendar.ics?time_zone=${timeZone}`,
        name: i18n("events_calendar.ical"),
      },
      {
        id: `${url}/calendar.rss?time_zone=${timeZone}`,
        name: i18n("events_calendar.rss"),
      },
    ];
  }

  @action
  onSelect() {}
}
