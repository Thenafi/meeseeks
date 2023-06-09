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

const isTimeExpired = (ttlTime, lastIndexUpdateTime) => {
  const now = new Date();
  const timeDiff = now.getTime() - lastIndexUpdateTime.getTime();
  const diffSeconds = timeDiff / 1000;
  if (diffSeconds > ttlTime) {
    return true;
  }
  return false;
};

module.exports = {
  convertToBoolean: convertToBoolean,
  getRandomNumberExcluding: getRandomNumberExcluding,
  isTimeExpired: isTimeExpired,
};
