/* eslint-disable ember/no-actions-hash, ember/no-classic-classes, ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { notEmpty } from "@ember/object/computed";
import Filter from "../../models/filter";

export default Component.extend({
  hasFilters: notEmpty("model.filters"),

  didInsertElement() {
    this._super(...arguments);
    if (!this.model.filters) {
      this.model.set("filters", []);
    }
  },

  actions: {
    addFilter() {
      const filter = Filter.create({ id: "new" });
      this.model.set("filters", [...this.model.filters, filter]);
    },

    removeFilter(filter) {
      this.model.set(
        "filters",
        this.model.filters.filter((item) => item !== filter)
      );
    },
  },
});
