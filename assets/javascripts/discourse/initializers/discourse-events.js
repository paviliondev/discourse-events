import EmberObject from "@ember/object";
import { scheduleOnce } from "@ember/runloop";
import {
  default as discourseComputed,
  observes,
} from "discourse/lib/decorators";
import { withPluginApi } from "discourse/lib/plugin-api";
import { CREATE_TOPIC } from "discourse/models/composer";
import { i18n } from "discourse-i18n";
import Provider from "../models/provider";

export default {
  name: "events-edits",
  initialize(container) {
    const siteSettings = container.lookup("service:site-settings");
    const currentUser = container.lookup("service:current-user");
    container.registry.register("model:provider", Provider);

    withPluginApi((api) => {
      api.serializeToDraft("event");
      api.serializeOnCreate("event");
      api.serializeToTopic("event", "topic.event");

      api.addDiscoveryQueryParam("end", { replace: true, refreshModel: true });
      api.addDiscoveryQueryParam("start", {
        replace: true,
        refreshModel: true,
      });

      api.modifyClass("model:composer", {
        pluginId: "discourse-events",

        @discourseComputed(
          "subtype",
          "category.events_enabled",
          "topicFirstPost",
          "topic.event",
          "canCreateEvent"
        )
        showEventControls(
          subtype,
          categoryEnabled,
          topicFirstPost,
          event,
          canCreateEvent
        ) {
          return (
            topicFirstPost &&
            (subtype === "event" || categoryEnabled || event) &&
            canCreateEvent
          );
        },

        @discourseComputed("category.events_min_trust_to_create")
        canCreateEvent(minTrust) {
          return currentUser.staff || currentUser.trust_level >= minTrust;
        },
      });

      api.modifyClass("component:composer-body", {
        pluginId: "discourse-events",

        @observes("composer.event")
        resizeWhenEventAdded() {
          this.composerResized();
        },

        showEventControls() {
          const showControls = this.get("composer.showEventControls");
          const controlsContainer = document.querySelector(
            ".composer-fields .title-and-category"
          );

          controlsContainer?.classList.toggle(
            "show-event-controls",
            Boolean(showControls)
          );

          if (showControls && controlsContainer) {
            const anchor = this.site.mobileView
              ? controlsContainer.querySelector(".title-input")
              : controlsContainer;
            const controls = document.querySelector(
              ".composer-controls-event"
            );
            if (anchor && controls) {
              anchor.append(controls);
            }
          }

          this.composerResized();
        },

        @observes("composer.showEventControls", "composer.composeState")
        applyEventInlineClass() {
          scheduleOnce("afterRender", this, this.showEventControls);
        },
      });

      api.modifyClass("model:topic", {
        pluginId: "discourse-events",

        @discourseComputed(
          "subtype",
          "category.events_enabled",
          "canCreateEvent"
        )
        showEventControls(subtype, categoryEnabled, canCreateEvent) {
          return (subtype === "event" || categoryEnabled) && canCreateEvent;
        },

        @discourseComputed("category.events_min_trust_to_create")
        canCreateEvent(minTrust) {
          return currentUser.staff || currentUser.trust_level >= minTrust;
        },

        @discourseComputed("last_read_post_number", "highest_post_number")
        topicListItemClasses(lastRead, highest) {
          let classes = "date-time title raw-link event-link raw-topic-link";
          if (lastRead === highest) {
            classes += " visited";
          }
          return classes;
        },
      });

      // necessary because topic-title plugin outlet only recieves model
      api.modifyClass("controller:topic", {
        pluginId: "discourse-events",

        @observes("editingTopic")
        setEditingTopicOnModel() {
          this.set("model.editingTopic", this.get("editingTopic"));
        },
      });

      api.modifyClass("route:discovery.category", {
        pluginId: "discourse-events",

        afterModel(model) {
          const calendarEnabled =
            siteSettings.events_calendar_enabled ||
            (model.category && model.category.events_calendar_enabled);

          if (
            model.filterType === "calendar" &&
            calendarEnabled &&
            this.templateName === "discovery/list"
          ) {
            this.templateName = "discovery/calendar";
          } else if (this.templateName === "discovery/calendar") {
            this.templateName = "discovery/list";
          }
        },
      });

      api.addNavigationBarItem({
        name: "calendar",
        displayName: "Calendar",
        customFilter: (category) => {
          return (
            siteSettings.events_calendar_enabled ||
            (category && category.events_calendar_enabled)
          );
        },
        customHref: (category) => {
          if (category) {
            return `${category.url}/l/calendar`;
          } else {
            return "/calendar";
          }
        },
      });

      api.addNavigationBarItem({
        name: "agenda",
        displayName: "Agenda",
        customFilter: (category) => {
          return (
            siteSettings.events_agenda_enabled ||
            (category && category.events_agenda_enabled)
          );
        },
        customHref: (category) => {
          if (category) {
            return `${category.url}/l/agenda`;
          } else {
            return "/agenda";
          }
        },
      });

      api.modifyClass("component:edit-category-settings", {
        pluginId: "discourse-events",

        @discourseComputed("category")
        availableViews(category) {
          let views = this._super(...arguments);

          if (category.get("custom_fields.events_agenda_enabled")) {
            views.push({
              name: i18n("filters.agenda.title"),
              value: "agenda",
            });
          }

          if (category.get("custom_fields.events_calendar_enabled")) {
            views.push({
              name: i18n("filters.calendar.title"),
              value: "calendar",
            });
          }

          return views;
        },
      });

      api.modifyClass("controller:preferences/interface", {
        pluginId: "discourse-events",

        @discourseComputed("makeThemeDefault")
        saveAttrNames(makeDefault) {
          let attrs = this._super(makeDefault);
          attrs.push("custom_fields");
          return attrs;
        },
      });

      const user = api.getCurrentUser();
      if (user && user.admin) {
        api.modifyClass("model:site-setting", {
          pluginId: "discourse-events",

          @discourseComputed("valid_values")
          allowsNone() {
            if (this.get("setting") === "events_timezone_default") {
              return "site_settings.events_timezone_default_placeholder";
            } else {
              this._super();
            }
          },
        });
      }

      api.modifyClass("controller:topic", {
        pluginId: "discourse-events",

        @observes("model.id")
        subscribeDiscourseEvents() {
          this.unsubscribeDiscourseEvents();

          this.messageBus.subscribe(
            `/discourse-events/${this.get("model.id")}`,
            (data) => {
              switch (data.type) {
                case "rsvp": {
                  if (data.rsvp) {
                    this.set(
                      `model.event.${data.rsvp.type}`,
                      data.rsvp.usernames
                    );

                    if (this.currentUser) {
                      const userRsvp = data.rsvp.usernames.includes(
                        this.currentUser.username
                      );

                      if (userRsvp) {
                        this.set("model.event_user", { rsvp: data.rsvp.type });
                      }
                    }
                  }
                }
              }
            }
          );
        },

        unsubscribeDiscourseEvents() {
          this.messageBus.unsubscribe(
            `/discourse-events/${this.get("model.id")}`
          );
        },
      });

      api.modifyClass("service:composer", {
        pluginId: "discourse-events",

        @discourseComputed(
          "model.action",
          "model.event",
          "model.category.events_required",
          "lastValidatedAt"
        )
        eventValidation(action, event, eventsRequired, lastValidatedAt) {
          if (action === CREATE_TOPIC && eventsRequired && !event) {
            return EmberObject.create({
              failed: true,
              reason: i18n("composer.error.event_missing"),
              lastShownAt: lastValidatedAt,
            });
          }
        },

        @observes("model.composeState")
        ensureEvent() {
          if (
            this.model &&
            this.model.topic &&
            this.model.topic.event &&
            !this.model.event
          ) {
            this.set("model.event", this.model.topic.event);
          }
        },

        // overriding cantSubmitPost on the model is more fragile
        save() {
          if (!this.get("eventValidation")) {
            this._super(...arguments);
          } else {
            this.set("lastValidatedAt", Date.now());
          }
        },
      });
    });
  },
};
