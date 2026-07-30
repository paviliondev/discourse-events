import Component from "@glimmer/component";
import { dasherize } from "@ember/string";
import { i18n } from "discourse-i18n";

export default class EventsProviderStatus extends Component {
  get title() {
    return i18n(`admin.events.provider.status.${this.args.status}.title`);
  }

  get class() {
    return `status ${dasherize(this.args.status)}`;
  }

  get label() {
    return i18n(`admin.events.provider.status.${this.args.status}.label`);
  }

  <template>
    <div class="events-provider-status">
      <span class={{this.class}} title={{this.title}}></span>
      <span>{{this.label}}</span>
    </div>
  </template>
}
