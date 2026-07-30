/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { action, computed } from "@ember/object";
import {
  attributeBindings,
  classNames,
  tagName,
} from "@ember-decorators/component";
import Provider, { OAUTH2_TYPES } from "../models/provider";

@tagName("tr")
@classNames("events-provider-row")
@attributeBindings("provider.id:data-provider-id")
export default class EventsProviderRow extends Component {
  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    this.set("currentProvider", JSON.parse(JSON.stringify(this.provider)));
  }

  @computed(
    "provider.name",
    "provider.url",
    "provider.provider_type",
    "provider.token",
    "provider.client_id",
    "provider.client_secret"
  )
  get providerChanged() {
    const current = this.currentProvider;
    return (
      current.name !== this.provider.name ||
      current.url !== this.provider.url ||
      current.provider_type !== this.provider.provider_type ||
      current.token !== this.provider.token ||
      current.client_id !== this.provider.client_id ||
      current.client_secret !== this.provider.client_secret
    );
  }

  @computed("provider.name", "provider.provider_type", "providerChanged")
  get saveDisabled() {
    return (
      !this.provider.name ||
      !this.providerChanged ||
      !this.provider.provider_type
    );
  }

  @computed("provider.provider_type")
  get canSave() {
    return this.provider.provider_type !== "icalendar";
  }

  @computed("providerChanged")
  get saveClass() {
    return this.providerChanged ? "save-provider btn-primary" : "save-provider";
  }

  @computed("canAuthenicate", "providerChanged", "provider.authenticated")
  get authenticateDisabled() {
    return (
      !this.canAuthenicate ||
      this.providerChanged ||
      this.provider.authenticated
    );
  }

  @computed("authenticateDisabled")
  get authenticateClass() {
    return this.authenticateDisabled ? "" : "btn-primary";
  }

  @computed("provider.provider_type")
  get canAuthenicate() {
    return (
      this.provider.provider_type &&
      OAUTH2_TYPES.includes(this.provider.provider_type)
    );
  }

  @computed("provider.provider_type")
  get providerLogo() {
    return `/plugins/discourse-events/logos/${this.provider.provider_type}.svg`;
  }

  @computed("provider.status")
  get showAuthenticate() {
    return this.provider.status === "not_authenticated";
  }

  @action
  saveProvider() {
    const provider = JSON.parse(JSON.stringify(this.provider));

    if (!provider.name) {
      return;
    }

    this.set("saving", true);

    Provider.update(provider)
      .then((result) => {
        if (result) {
          this.setProperties({
            currentProvider: result.provider,
            provider: Provider.create(result.provider),
          });
        } else if (this.currentProvider.id !== "new") {
          this.set(
            "provider",
            JSON.parse(JSON.stringify(this.currentProvider))
          );
        }
      })
      .finally(() => {
        this.set("saving", false);
      });
  }

  @action
  authenticateProvider() {
    window.location.href = `/admin/plugins/events/provider/${this.provider.id}/authorize`;
  }
}
