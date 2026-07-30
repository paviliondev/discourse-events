/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { action, computed } from "@ember/object";
import { i18n } from "discourse-i18n";
import { OAUTH2_TYPES, TOKEN_TYPES } from "../models/provider";

export default class EventsProviderCredentials extends Component {
  hideCredentials = true;

  @computed("provider.provider_type")
  get title() {
    const providerLabel = i18n(
      `admin.events.provider.provider_type.${this.provider?.provider_type}`
    );
    const credsLabel = i18n("admin.events.provider.credentials.label");
    return `${providerLabel} ${credsLabel}`;
  }

  @computed("provider.provider_type")
  get showToken() {
    return (
      this.provider?.provider_type &&
      TOKEN_TYPES.includes(this.provider.provider_type)
    );
  }

  @computed("provider.provider_type")
  get showClientCredentials() {
    return (
      this.provider?.provider_type &&
      OAUTH2_TYPES.includes(this.provider.provider_type)
    );
  }

  @action
  toggleHideCredentials() {
    this.toggleProperty("hideCredentials");
  }
}
