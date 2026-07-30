import { service } from "@ember/service";
import DiscourseRoute from "discourse/routes/discourse";
import { i18n } from "discourse-i18n";
import Filter from "../models/filter";
import Provider from "../models/provider";
import Source from "../models/source";
import SourceOptions from "../models/source-options";

export default DiscourseRoute.extend({
  store: service(),

  model() {
    return Source.all();
  },

  setupController(controller, model) {
    const importPeriods = [];
    Object.keys(model.import_periods).forEach((period) => {
      importPeriods.push({
        id: model.import_periods[period],
        name: i18n(`admin.events.source.import_period.${period}`),
      });
    });

    controller.setProperties({
      sources: model.sources.map((s) => {
        s.source_options = SourceOptions.create(s.source_options);
        if (s.filters) {
          s.filters = s.filters.map((f) => {
            return Filter.create(f);
          });
        }
        return Source.create(s);
      }),
      providers: Provider.toArray(this.store, model.providers),
      importPeriods,
      sourceOptionFields: model.source_options,
    });
    controller.setMessage("info");
  },
});
