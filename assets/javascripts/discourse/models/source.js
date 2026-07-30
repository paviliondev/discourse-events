import EmberObject, { computed } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import Site from "discourse/models/site";

export default class Source extends EmberObject {
  static all() {
    return ajax("/admin/plugins/events/source").catch(popupAjaxError);
  }

  static update(source) {
    return ajax(`/admin/plugins/events/source/${source.id}`, {
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify({ source }),
    }).catch(popupAjaxError);
  }

  static destroy(source) {
    return ajax(`/admin/plugins/events/source/${source.id}`, {
      type: "DELETE",
    }).catch(popupAjaxError);
  }

  static importEvents(source) {
    return ajax(`/admin/plugins/events/source/${source.id}/import`, {
      type: "POST",
    }).catch(popupAjaxError);
  }

  static syncTopics(source) {
    return ajax(`/admin/plugins/events/source/${source.id}/topics`, {
      type: "POST",
    }).catch(popupAjaxError);
  }

  @computed("import_type")
  get canImport() {
    return (
      this.import_type === "import" || this.import_type === "import_publish"
    );
  }

  @computed("category_id")
  get category() {
    return Site.current().categoriesList.find(
      (category) => category.id === this.category_id
    );
  }
}
