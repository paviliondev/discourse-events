import { computed } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import singleton from "discourse/lib/singleton";
import RestModel from "discourse/models/rest";

export const TOKEN_TYPES = ["eventbrite", "humanitix", "eventzilla"];
export const NO_AUTH_TYPES = ["icalendar"];
export const OAUTH2_TYPES = ["meetup", "outlook", "google"];

@singleton
export default class Provider extends RestModel {
  @computed("id")
  get stored() {
    return this.id && this.id !== "new";
  }

  @computed("hasCredentials", "stored", "authenticated")
  get status() {
    if (this.hasCredentials) {
      return this.authenticated ? "ready" : "not_authenticated";
    } else {
      return this.stored ? "ready" : "not_ready";
    }
  }

  @computed("provider_type")
  get hasCredentials() {
    return this.provider_type && !NO_AUTH_TYPES.includes(this.provider_type);
  }
}

Provider.reopenClass({
  all() {
    return ajax("/admin/plugins/events/provider").catch(popupAjaxError);
  },

  update(provider) {
    return ajax(`/admin/plugins/events/provider/${provider.id}`, {
      type: "PUT",
      data: {
        provider,
      },
    }).catch(popupAjaxError);
  },

  destroy(provider) {
    return ajax(`/admin/plugins/events/provider/${provider.id}`, {
      type: "DELETE",
    }).catch(popupAjaxError);
  },

  toArray(store, providers) {
    return providers.map((provider) => {
      return store.createRecord("provider", provider);
    });
  },
});
