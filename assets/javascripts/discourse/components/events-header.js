/* eslint-disable discourse/discourse-common-imports, discourse/i18n-import-location, ember/no-classic-classes, ember/no-classic-components, ember/require-tagless-components, simple-import-sort/imports */
import Component from "@ember/component";
import discourseComputed from "discourse-common/utils/decorators";
import I18n from "I18n";

export default Component.extend({
  classNames: ["events-header"],

  @discourseComputed("viewName")
  title(viewName) {
    return I18n.t(`admin.events.${viewName}.title`);
  },
});
