const regexUsernameAsStringPattern = "^[A-Za-z][A-Za-z\\d]{4,15}$";

const regexPasswordAsStringPattern = "^[A-Za-z\\d!@#$%^&*()_+{}[\\]\\|]{5,16}$";

const newUserSettingsSchema = {
  $id: "newUserSettingsSchema",
  type: "object",
  properties: {
    username: {
      type: "string",
      pattern: regexUsernameAsStringPattern,
    },
    password: {
      type: "string",
      pattern: regexPasswordAsStringPattern,
    },
  },
  required: ["username", "password"],
  additionalProperties: false,
};

const settingsSchema = {
  $id: "settingsSchema",
  type: "object",
  properties: {
    linksList: {
      type: "array",
      items: {
        type: "string",
        format: "uri",
      },
      minItems: 2,
      maxItems: 200,
    },
    ttl: {
      type: "integer",
      minimum: 0,
      maximum: 604800,
    },
    randomness: {
      type: "boolean",
    },
    password: {
      type: "string",
      pattern: regexPasswordAsStringPattern,
    },
    username: {
      type: "string",
      pattern: regexUsernameAsStringPattern,
    },
  },
  required: ["linksList", "ttl", "randomness", "password"],
  additionalProperties: false,
};

module.exports = {
  newUserSettingsSchema,
  settingsSchema,
};
