import { computed } from "@ember/object";
import { service } from "@ember/service";
import { classNames } from "@ember-decorators/component";
import { selectKitOptions } from "discourse/select-kit/components/select-kit";
import SingleSelectComponent from "discourse/select-kit/components/single-select";
import { i18n } from "discourse-i18n";

@classNames("combo-box", "events-subscription-selector")
@selectKitOptions({
  autoFilterable: false,
  filterable: false,
  showFullTitle: true,
  headerComponent:
    "events-subscription-selector/events-subscription-selector-header",
  caretUpIcon: "caret-up",
  caretDownIcon: "caret-down",
})
export default class EventsSubscriptionSelector extends SingleSelectComponent {
  @service("events-subscription") subscription;

  @computed("feature", "attribute", "subscription.features", "allowedValues")
  get content() {
    const attributes = (this.subscription.features || {})[this.feature];
    if (!attributes) {
      return [];
    }

    const values = attributes[this.attribute];
    if (!values) {
      return [];
    } else {
      return Object.keys(values)
        .filter((value) =>
          this.allowedValues ? this.allowedValues.includes(value) : true
        )
        .map((value) => {
          let i18nkey = `admin.events.${this.feature}.${this.attribute}.${value}`;
          if (this.i18nSuffix) {
            i18nkey += `.${this.i18nSuffix}`;
          }
          return {
            id: value,
            name: i18n(i18nkey),
          };
        });
    }
  }

  modifyComponentForRow() {
    return "events-subscription-selector/events-subscription-selector-row";
  }
}
