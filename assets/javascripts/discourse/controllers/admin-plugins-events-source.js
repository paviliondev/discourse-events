/* eslint-disable ember/no-actions-hash, ember/no-classic-classes, ember/no-mixins */
import Controller from "@ember/controller";
import { notEmpty } from "@ember/object/computed";
import { service } from "@ember/service";
import { i18n } from "discourse-i18n";
import Message from "../mixins/message";
import Source from "../models/source";
import SourceOptions from "../models/source-options";

export default Controller.extend(Message, {
  hasSources: notEmpty("sources"),
  viewName: "source",
  dialog: service(),
  router: service(),

  actions: {
    addSource() {
      const sources = this.sources;
      if (!sources.some((source) => source.id === "new")) {
        this.set("sources", [
          Source.create({
            id: "new",
            source_options: SourceOptions.create(),
          }),
          ...sources,
        ]);
      }
    },

    removeSource(source) {
      if (source.id === "new") {
        this.set(
          "sources",
          this.sources.filter((item) => item !== source)
        );
      } else {
        this.dialog.confirm({
          message: i18n("admin.events.source.remove.confirm"),
          confirmButtonLabel: "admin.events.source.remove.label",
          cancelButtonLabel: "cancel",
          didConfirm: () => {
            Source.destroy(source).then(() => {
              this.set(
                "sources",
                this.sources.filter((item) => item !== source)
              );
            });
          },
        });
      }
    },
  },
});
