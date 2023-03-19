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

function getRandomNumberExcluding(excludedNumber, maxNumber) {
  let randomNumber = Math.floor(Math.random() * maxNumber);
  while (randomNumber === excludedNumber) {
    randomNumber = Math.floor(Math.random() * maxNumber);
  }
  return randomNumber;
}

module.exports = { convertToBoolean, getRandomNumberExcluding };
