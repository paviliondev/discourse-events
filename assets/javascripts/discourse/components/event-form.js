import Component from "@ember/component";
import { later, scheduleOnce } from "@ember/runloop";
import {
  default as discourseComputed,
  observes,
} from "discourse-common/utils/decorators";
import {
  compileEvent,
  formTimeFormat,
  nextInterval,
  setupEventForm,
  timezoneLabel,
} from "../lib/date-utilities";

export default Component.extend({
  classNames: "event-form",
  endEnabled: false,
  allDay: false,
  showTimezone: false,

  didInsertElement() {
    this._super(...arguments);
    const props = setupEventForm(this.event, {
      siteSettings: this.siteSettings,
    });
    this.setProperties(props);
    this.setupTimePicker("start");
    this.setupTimePicker("end");

    if (
      this.siteSettings.events_add_default_end_time &&
      !this.event &&
      !this.endDate &&
      !this.endTime
    ) {
      this.send("toggleEndEnabled", true);
    }
  },

  eventValid(event) {
    return !event || !event.end || moment(event.end).isSameOrAfter(event.start);
  },

  @observes(
    "startDate",
    "startTime",
    "endDate",
    "endTime",
    "endEnabled",
    "allDay",
    "timezone",
    "rsvpEnabled",
    "goingMax",
    "usersGoing"
  )
  eventUpdated() {
    let event = compileEvent({
      startDate: this.startDate,
      startTime: this.startTime,
      endDate: this.endDate,
      endTime: this.endTime,
      endEnabled: this.endEnabled,
      allDay: this.allDay,
      timezone: this.timezone,
      rsvpEnabled: this.rsvpEnabled,
      goingMax: this.goingMax,
      usersGoing: this.usersGoing,
    });
    this.updateEvent(event, this.eventValid(event));
  },

  setupTimePicker(type) {
    const time = this.get(`${type}Time`);
    later(this, () => {
      scheduleOnce("afterRender", this, () => {
        const $timePicker = $(`#${type}-time-picker`);
        $timePicker.timepicker({
          timeFormat: this.siteSettings.events_event_timepicker_format,
        });
        $timePicker.timepicker("setTime", time);
        $timePicker.change(() => {
          this.set(`${type}Time`, $timePicker.timepicker("getTime"));
        });
      });
    });
  },

  @discourseComputed()
  timezones() {
    const eventTimezones =
      this.get("eventTimezones") || this.site.event_timezones;
    return eventTimezones.map((tz) => {
      return {
        value: tz.value,
        name: timezoneLabel(tz.value, { siteSettings: this.siteSettings }),
      };
    });
  },

  @discourseComputed("endEnabled")
  endClass(endEnabled) {
    return endEnabled ? "" : "disabled";
  },

  actions: {
    toggleEndEnabled(value) {
      this.set("endEnabled", value);

      if (value) {
        if (!this.endDate) {
          this.set("endDate", this.startDate);
        }

        if (!this.allDay) {
          if (!this.endTime) {
            let start = moment(this.startDate + " " + this.startTime);
            this.set(
              "endTime",
              moment(start).add(1, "hours").format(formTimeFormat)
            );
          }

          this.setupTimePicker("end");
        }
      } else {
        this.setProperties({
          endDate: undefined,
          endTime: undefined,
        });
      }
    },

    toggleAllDay(value) {
      this.set("allDay", value);

      if (!value) {
        const start = nextInterval();

        this.set("startTime", start.format(formTimeFormat));
        this.setupTimePicker("start");

        if (this.endEnabled) {
          const end = moment(start).add(1, "hours");

          this.set("endTime", end.format(formTimeFormat));
          this.setupTimePicker("end");
        }
      }
    },
  },
});
