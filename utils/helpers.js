// function that converts string true/false to boolean

const convertToBoolean = (string) => {
  //check if the string is a boolean type
  if (typeof string === "boolean") {
    return string;
  }

  if (string.toLowerCase() === "true") {
    return true;
  } else {
    return false;
  }
};
module.exports = { convertToBoolean: convertToBoolean };
