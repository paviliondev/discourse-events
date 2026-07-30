import Component from "@glimmer/component";
import dIcon from "discourse/ui-kit/helpers/d-icon";
import { i18n } from "discourse-i18n";

export default class EventVideoBtn extends Component {
  get label() {
    return i18n("topic.event.video.label");
  }

  <template>
    <a
      href={{@video_url}}
      target="_blank"
      role="button"
      class="btn btn-primary btn-event-video"
      rel="noopener noreferrer"
    >
      {{dIcon "video"}}
      <span>{{this.label}}</span>
    </a>
  </template>
}
