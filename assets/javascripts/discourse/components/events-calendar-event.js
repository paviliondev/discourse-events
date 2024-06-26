import Component from "@ember/component";
import { action } from "@ember/object";
import DiscourseURL from "discourse/lib/url";

export default Component.extend({
  tagName: "li",

  @action
  selectEvent(url) {
    event?.preventDefault();
    const responsive = this.get("responsive");
    if (responsive) {
      DiscourseURL.routeTo(url);
    } else {
      this.toggleProperty("showEventCard");
    }
  },
});
