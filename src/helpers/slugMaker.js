const { default: slugify } = require("slugify");

exports.createSlug = (string) => {
  return slugify(string, {
    replacement: "-",
    remove: undefined, 
    lower: true,
    strict: false,
    locale: "vi",
    trim: true,
  });
};
