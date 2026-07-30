/* eslint-disable ember/no-actions-hash, ember/no-classic-classes, ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { alias } from "@ember/object/computed";

export default Component.extend({
  layoutName: "javascripts/wizard/templates/components/wizard-field-event",
  eventTimezones: alias("field.event_timezones"),

  actions: {
    updateEvent(event, status) {
      this.set("field.value", event);
      this.field.setValid(status);
    },
  },
});
