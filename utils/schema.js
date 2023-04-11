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
        maxLength: 700,
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
    periodicity: {
      type: "boolean",
    },
  },
  required: ["linksList", "ttl", "randomness", "password"],
  additionalProperties: false,
  allOf: [
    {
      if: {
        properties: {
          ttl: {
            type: "integer",
            minimum: 3600,
          },
          randomness: {
            type: "boolean",
            const: false,
          },
        },
        required: ["ttl", "randomness"],
      },
      then: {
        properties: {
          periodicity: {
            type: "boolean",
            enum: [true, false],
          },
        },
        required: ["periodicity"],
      },
      else: {
        properties: {
          periodicity: {
            type: "boolean",
            const: false,
          },
        },
      },
    },
  ],
};

module.exports = {
  newUserSettingsSchema,
  settingsSchema,
};
