/* eslint-disable ember/no-actions-hash, ember/no-classic-classes, ember/no-mixins */
import Controller from "@ember/controller";
import { notEmpty } from "@ember/object/computed";
import { service } from "@ember/service";
import { i18n } from "discourse-i18n";
import Message from "../mixins/message";
import Provider from "../models/provider";

export default Controller.extend(Message, {
  hasProviders: notEmpty("providers"),
  viewName: "provider",
  dialog: service(),

  actions: {
    addProvider() {
      this.set("providers", [
        ...this.providers,
        Provider.create({
          id: "new",
        }),
      ]);
    },

    removeProvider(provider) {
      if (provider.id === "new") {
        this.set(
          "providers",
          this.providers.filter((item) => item !== provider)
        );
      } else {
        this.dialog.confirm({
          message: i18n("admin.events.provider.remove.confirm", {
            provider_name: provider.name,
          }),
          confirmButtonLabel: "admin.events.provider.remove.label",
          cancelButtonLabel: "cancel",
          didConfirm: () => {
            Provider.destroy(provider).then(() => {
              this.set(
                "providers",
                this.providers.filter((item) => item !== provider)
              );
            });
          },
        });
      }
    },
  },
});
