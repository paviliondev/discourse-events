import Component from "@glimmer/component";
import { array } from "@ember/helper";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { trustHTML } from "@ember/template";
import DTooltip from "discourse/float-kit/components/d-tooltip";
import { cook } from "discourse/lib/text";
import DiscourseURL from "discourse/lib/url";
import dCategoryLink from "discourse/ui-kit/helpers/d-category-link";
import dDiscourseTags from "discourse/ui-kit/helpers/d-discourse-tags";
import dIcon from "discourse/ui-kit/helpers/d-icon";
import dReplaceEmoji from "discourse/ui-kit/helpers/d-replace-emoji";
import { eventLabel } from "../lib/date-utilities";

export default class EventsCalendarCard extends Component {
  @service siteSettings;

  constructor(owner, args) {
    super(owner, args);
    this.loadCookedText();
  }

  @action
  async loadCookedText() {
    if (this.args.event.topic) {
      const cookedExcerpt = await cook(this.args.event.topic.excerpt);
      const cookedTitle = await cook(this.args.event.topic.title);
      this.cookedExcerpt = cookedExcerpt;
      this.cookedTitle = cookedTitle;
    }
  }

  get topicEventLabel() {
    return eventLabel(this.args.event.topic.event, {
      useEventTimezone: true,
      siteSettings: this.siteSettings,
    });
  }

  @action
  goToTopic() {
    event?.preventDefault();
    DiscourseURL.routeTo(this.args.event.topic.url);
  }

  <template>
    <DTooltip
      @interactive={{true}}
      @triggers={{array "click"}}
      @identifier="events-calendar-card"
      @arrow={{false}}
    >
      <:trigger>
        <div class={{@event.classes}} style={{@event.listStyle}}>
          {{#unless @event.allDay}}
            <span style={{@event.dotStyle}}>{{dIcon "circle"}}</span>
          {{/unless}}
          {{#if @event.time}}
            <span class="time">{{@event.time}}</span>
          {{/if}}
          {{#if @event.title}}
            <span class="title" style={{@event.titleStyle}}>{{dReplaceEmoji
                @event.title
              }}</span>
          {{/if}}
        </div>
      </:trigger>
      <:content>
        <div class="events-calendar-card" data-topic-id={{@event.topic.id}}>
          <a class="topic-link" href {{on "click" this.goToTopic}}>
            {{this.cookedTitle}}
          </a>

          <div class="topic-meta">
            {{dCategoryLink @event.topic.category}}
            {{dDiscourseTags @event.topic mode="list"}}
          </div>

          <a href class="topic-event" {{on "click" this.goToTopic}}>
            {{trustHTML this.topicEventLabel}}
          </a>

          <a href class="topic-excerpt" {{on "click" this.goToTopic}}>
            {{this.cookedExcerpt}}
          </a>
        </div>
      </:content>
    </DTooltip>
  </template>
}
