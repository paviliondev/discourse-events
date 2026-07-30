import { later } from "@ember/runloop";
import copyText from "discourse/lib/copy-text";
import DropdownSelectBoxRowComponent from "discourse/select-kit/components/dropdown-select-box/dropdown-select-box-row";

export default DropdownSelectBoxRowComponent.extend({
  layoutName: "discourse/templates/components/events-calendar-subscription-row",
  classNames: "events-calendar-subscription-row",

  click() {
    const copyRange = document.createElement("p");
    copyRange.id = "copy-range";
    copyRange.textContent = this.item.id;
    document.body.append(copyRange);

    if (copyText(this.item.id, copyRange)) {
      this.set("copiedUrl", true);
      later(() => {
        if (!this.element || this.isDestroying || this.isDestroyed) {
          return;
        }
        this.set("copiedUrl", false);
      }, 2000);
    }

    copyRange.remove();
  },
});
