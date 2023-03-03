const desiredDimensions = correctOrientation([
    { height: 400, width: 1002 },
    { height: 1002, width: 2813 },
    { height: 1002, width: 2813 },
    { height: 2813, width: 1002 },
    { height: 2813, width: 1002 },
    { height: 1002, width: 2813 },
    { height: 2813, width: 1002 }
]);

const size1 = { height: 3600, width: 2600 };
const size2 = { height: 3000, width: 2600 };
const size3 = { height: 2700, width: 2600 };
const size4 = { height: 2300, width: 2600 };
const size5 = { height: 1800, width: 2600 };
const size6 = { height: 1500, width: 2600 };
const size7 = { height: 1150, width: 2600 };
const size8 = { height: 900, width: 2600 };
const size9 = { height: 3600, width: 1300 };
const size10 = { height: 3000, width: 1300 };
const size11 = { height: 2300, width: 1300 };
const size12 = { height: 1800, width: 1300 };
const sizes = correctOrientation([
    size1,
    size2,
    size3,
    size4,
    size5,
    size6,
    size7,
    size8,
    size9,
    size10,
    size11,
    size12
]);

// Sort size by area ascending (to choose the smallest size for the required cut)
let sortedSizes = sizes.sort((a, b) => a.height * a.width - b.height * b.width);
// Sort desired dimensions by area descending (to start with the biggest cut first)
let sortedDesiredDimensions = desiredDimensions.sort((a, b) => b.height * b.width - a.height * a.width);

let scale = 0.1; // TODO: improve to auto-scale

let availablePieces = [];
let finishedPieces = [];
let requiredSizes = [];
