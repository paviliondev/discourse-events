/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { action, computed } from "@ember/object";
import { service } from "@ember/service";
import {
  attributeBindings,
  classNames,
  tagName,
} from "@ember-decorators/component";
import Filter, { filtersMatch } from "../models/filter";
import Source from "../models/source";
import SourceOptions from "../models/source-options";
import EventsFilters from "./modal/events-filters";

const isEqual = function (obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

@tagName("tr")
@classNames("events-source-row")
@attributeBindings("source.id:data-source-id")
export default class EventsSourceRow extends Component {
  @service modal;
  @service siteSettings;

  @computed("source.filters.[]")
  get hasFilters() {
    return Boolean(this.source.filters?.length);
  }

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    this.set("currentSource", JSON.parse(JSON.stringify(this.source)));
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);
    this.setMessage("info", "info");
  }

  @computed(
    "source.topic_sync",
    "source.provider_id",
    "source.import_type",
    "source.import_period",
    "source.source_options",
    "source.user.username",
    "source.category_id",
    "source.client",
    "source.filters.[]",
    "source.filters.@each.query_column",
    "source.filters.@each.query_operator",
    "source.filters.@each.query_value"
  )
  get sourceChanged() {
    const cs = this.currentSource;
    return (
      cs.topic_sync !== this.source.topic_sync ||
      cs.provider_id !== this.source.provider_id ||
      cs.import_period !== this.source.import_period ||
      !isEqual(
        cs.source_options,
        JSON.parse(JSON.stringify(this.source.source_options))
      ) ||
      !filtersMatch(this.source.filters, cs.filters) ||
      cs.import_type !== this.source.import_type ||
      cs.user?.username !== this.source.user?.username ||
      cs.category_id !== this.source.category_id ||
      cs.client !== this.source.client
    );
  }

  @computed("sourceChanged", "source.provider_id", "sourceOptions.@each.value")
  get saveDisabled() {
    return (
      !this.sourceChanged ||
      !this.source.provider_id ||
      !this.sourceOptions ||
      this.sourceOptions.some((opt) => !opt.value)
    );
  }

  @computed("sourceChanged")
  get saveClass() {
    return this.sourceChanged ? "btn-primary save-source" : "save-source";
  }

  @computed("importDisabled")
  get importClass() {
    return this.importDisabled ? "import-source" : "btn-primary import-source";
  }

  @computed(
    "sourceChanged",
    "source.id",
    "importing",
    "saving",
    "source.ready",
    "source.canImport"
  )
  get importDisabled() {
    return (
      this.sourceChanged ||
      this.source.id === "new" ||
      this.importing ||
      this.saving ||
      !this.source.ready ||
      !this.source.canImport
    );
  }

  @computed("source.canImport")
  get importPeriodDisabled() {
    return !this.source.canImport;
  }

  @computed("source.provider_id")
  get provider() {
    return this.providers?.find((p) => p.id === this.source.provider_id);
  }

  @computed("sourceOptionFields", "provider.provider_type")
  get providerSourceOptionFields() {
    if (this.sourceOptionFields) {
      return this.sourceOptionFields[this.provider?.provider_type];
    } else {
      return [];
    }
  }

  @computed("sourceOptionFields")
  get sourceOptionsDisabled() {
    return !this.sourceOptionFields || this.sourceOptionFields.length === 0;
  }

  @computed("source.source_options", "providerSourceOptionFields.[]")
  get sourceOptions() {
    if (!this.providerSourceOptionFields) {
      return [];
    }
    return this.providerSourceOptionFields.map((opt) => {
      return {
        name: opt.name,
        value: this.source.source_options[opt.name],
        type: opt.type,
      };
    });
  }

  @computed("provider.provider_type")
  get allowedImportTypeValues() {
    if (this.provider?.provider_type === "icalendar") {
      return ["import"];
    } else {
      return null;
    }
  }

  @computed("providers.@each.status")
  get allowedProviderTypeValues() {
    return this.providers
      .filter((p) => p.status === "ready")
      .map((p) => p.provider_type);
  }

  @computed(
    "siteSettings.calendar_enabled",
    "siteSettings.discourse_post_event_enabled"
  )
  get allowedClientValues() {
    const allowedClients = ["discourse_events"];
    if (
      this.siteSettings.calendar_enabled &&
      this.siteSettings.discourse_post_event_enabled
    ) {
      allowedClients.push("discourse_calendar");
    }
    return allowedClients;
  }

  @computed(
    "sourceChanged",
    "saving",
    "syncing",
    "source.client",
    "source.topic_sync",
    "source.category_id",
    "source.user.username"
  )
  get syncTopicsDisabled() {
    return (
      this.sourceChanged ||
      this.saving ||
      this.syncing ||
      !this.source.client ||
      !this.source.topic_sync ||
      !this.source.category_id ||
      !this.source.user?.username
    );
  }

  @action
  openFilters() {
    this.modal.show(EventsFilters, {
      model: this.source,
    });
  }

  @action
  updateUser(usernames) {
    const source = this.source;
    if (!source.user) {
      source.set("user", {});
    }
    source.set("user.username", usernames[0]);
  }

  @action
  updateSourceOptions(name, event) {
    this.source.source_options.set(name, event.target.value);
    this.source.notifyPropertyChange("source_options");
  }

  @action
  updateProvider(providerType) {
    const provider = this.providers?.find(
      (p) => p.provider_type === providerType
    );
    this.set("source.provider_id", provider.id);
  }

  @action
  saveSource() {
    const source = JSON.parse(JSON.stringify(this.source));

    const supportedOptions = this.sourceOptionFields[
      this.provider.provider_type
    ].map((option) => option.name);

    source.source_options = Object.keys(source.source_options)
      .filter((name) => supportedOptions.includes(name))
      .reduce((object, key) => {
        object[key] = source.source_options[key];
        return object;
      }, {});

    if (source.import_period === 0) {
      source.import_period = null;
    }

    if (source.user) {
      source.username = source.user.username;
      delete source.user;
    } else {
      source.username = null;
    }

    this.set("saving", true);

    Source.update(source)
      .then((result) => {
        if (result) {
          const sourceParams = Object.assign(result.source, {
            source_options: SourceOptions.create(result.source.source_options),
          });
          if (result.source.filters) {
            sourceParams.filters = result.source.filters.map((filter) => {
              return Filter.create(filter);
            });
          }
          this.setProperties({
            currentSource: result.source,
            source: Source.create(sourceParams),
          });
        } else if (this.currentSource.id !== "new") {
          this.set("source", JSON.parse(JSON.stringify(this.currentSource)));
        }
      })
      .finally(() => {
        this.set("saving", false);
      });
  }

  @action
  importSource() {
    this.set("importing", true);
    Source.importEvents(this.source)
      .then((result) => {
        if (result.success) {
          this.setMessage("event_import_started", "success");
        } else {
          this.setMessage("event_import_failed_to_start", "error");
        }
      })
      .finally(() => {
        this.set("importing", false);

        setTimeout(() => {
          if (!this.isDestroying && !this.isDestroyed) {
            this.setMessage("info", "info");
          }
        }, 5000);
      });
  }

  @action
  syncTopics() {
    const source = this.source;

    this.set("syncing", true);
    Source.syncTopics(source)
      .then((result) => {
        if (result.success) {
          this.setMessage("topic_creation_started", "success");
        } else {
          this.setMessage("topic_creation_failed_to_start", "error");
        }
      })
      .finally(() => {
        this.set("syncing", false);

        setTimeout(() => {
          if (!this.isDestroying && !this.isDestroyed) {
            this.setMessage("info", "info");
          }
        }, 5000);
      });
  }
}
