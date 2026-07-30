/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { computed } from "@ember/object";
import { classNames } from "@ember-decorators/component";
import { i18n } from "discourse-i18n";

@classNames("events-header")
export default class EventsHeader extends Component {
  @computed("viewName")
  get title() {
    return i18n(`admin.events.${this.viewName}.title`);
  }
}
