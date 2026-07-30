import { i18n } from "discourse-i18n";

function convertName(string) {
  return string.replace(/[_\-]+/g, " ").toLowerCase();
}

function contentsMap(items, key = null) {
  return items.map((item) => {
    return {
      id: item,
      name: key ? i18n(`${key}.${item}`) : convertName(item),
    };
  });
}

export { convertName, contentsMap };
