// function that converts string true/false to boolean

const convertToBoolean = (string) => {
  if (string.toLowerCase() === "true") {
    return true;
  } else {
    return false;
  }
};
module.exports = { convertToBoolean: convertToBoolean };
