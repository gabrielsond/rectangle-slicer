function cutPieces() {
    for (let x = 0; x < sortedDesiredDimensions.length; x++) {
        let desiredDimension = sortedDesiredDimensions[x];
        let suitablePiece = getAvailablePiece(desiredDimension);

        if (suitablePiece) {
            availablePieces = availablePieces.filter(piece => piece !== suitablePiece); // remove suitable piece
            cutRectangleAndSort(desiredDimension, suitablePiece);
        } else {
            let nextDesiredDimension = null;
            try {
                nextDesiredDimension = sortedDesiredDimensions[x + 1];
            } catch (ex) {
                console.log("Critical Error! (See next log entry for more info)");
                console.log(ex);
            }
            let combinedRectangle = combineRectangles(desiredDimension, nextDesiredDimension);
            let newPiece = getNewPiece(combinedRectangle, nextDesiredDimension);
            if (!newPiece) {
                throw new Error(`No suitable size available for desired dimension: ${combinedRectangle.width}x${combinedRectangle.height}`);
            }
            cutRectangleAndSort(desiredDimension, newPiece);
        }
    }
}

function getAvailablePiece(desiredDimension) {
    // Sort available pieces by area ascending
    availablePieces = sortDimensions(availablePieces); // TODO: still necessary?

    // Look in available pieces for a suitable piece with suitable dimensions
    let suitablePiece = null;
    for (let availablePiece of availablePieces) {
        if (canRectangleFit(desiredDimension, availablePiece)) {
            suitablePiece = availablePiece;
            break;
        }
    }
    return suitablePiece;
}

function getNewPiece(desiredDimension) {
    let newPiece = null;
    for (let size of sizes) {
        if (canRectangleFit(desiredDimension, size)) {
            newPiece = { height: size.height, width: size.width, cuts: [], parent: null };
            requiredSizes.push(newPiece);
            break;
        }
    }
    return newPiece;
}

function cutRectangleAndSort(desired, base) {
    let cuts = cutRectangle(desired, base);
    if (cuts.firstRemainingCut.height > 0 && cuts.firstRemainingCut.width > 0) {
        availablePieces.push(cuts.firstRemainingCut);
    }
    if (cuts.secondRemainingCut.height > 0 && cuts.secondRemainingCut.width > 0) {
        availablePieces.push(cuts.secondRemainingCut);
    }
    finishedPieces.push(cuts.desiredCut);
}

function cutRectangle(desired, base) {
    if (!canRectangleFit(desired, base)) {
        throw new Error(`Cannot cut ${desired.height}x${desired.width} from ${base.height}x${base.width}.`);
    }

    // Calculate the dimensions of the remaining rectangles
    let firstRemaining = null;
    let secondRemaining = null;
    if (desired.height <= base.height && desired.width <= base.width) {
        firstRemaining = { height: base.height - desired.height, width: desired.width, cuts: [], parent: base };
        secondRemaining = { height: base.height, width: base.width - desired.width, cuts: [], parent: base };
    } else if (desired.width <= base.height && desired.height <= base.width) {
        firstRemaining = { height: base.width - desired.height, width: desired.width, cuts: [], parent: base };
        secondRemaining = { height: base.width, width: base.height - desired.width, cuts: [], parent: base };
    } else {
        throw new Error("Critical error");
    }

    // establish relationships
    desired.parent = base;
    if (base.parent && base.parent != null && base.parent.cuts && base.parent.cuts != null) {
        base.parent.cuts.push(desired);
        if (base.parent.parent && base.parent.parent != null && base.parent.parent.cuts && base.parent.parent.cuts != null) {
            base.parent.parent.cuts.push(desired);
        }
    }
    base.cuts.push(desired);

    // Return the three rectangles as an array
    return { desiredCut: desired, firstRemainingCut: firstRemaining, secondRemainingCut: secondRemaining };
}

function canRectangleFit(desired, base) {
    const rect1Length = Math.max(desired.height, desired.width);
    const rect1Width = Math.min(desired.height, desired.width);
    const rect2Length = Math.max(base.height, base.width);
    const rect2Width = Math.min(base.height, base.width);

    return rect1Length <= rect2Length && rect1Width <= rect2Width;
}

function combineRectangles(rect1, rect2) {
    const minWidth1 = rect1.width + rect2.width;
    const minHeight1 = Math.max(rect1.height, rect2.height);
    const area1 = minWidth1 * minHeight1;
    const minWidth2 = Math.max(rect1.width, rect2.width);
    const minHeight2 = rect1.height + rect2.height;
    const area2 = minWidth2 * minHeight2;
    if (area1 > area2) {
        return { width: minWidth2, height: minHeight2 };
    } else {
        return { width: minWidth1, height: minHeight1 };
    }
}

function generateRectanglesSVGs(rectangles) {
    const svgNS = "http://www.w3.org/2000/svg";
    const brightnessRange = 0.85; // brightness range for colors
    const cutBrightnessRange = 0.4;
    const container = document.createElement("div");

    rectangles.forEach((rect, i) => {
        const mainSvg = document.createElementNS(svgNS, "svg");
        mainSvg.setAttribute("width", rect.width * scale);
        mainSvg.setAttribute("height", rect.height * scale);

        const mainRectEl = document.createElementNS(svgNS, "rect");
        mainRectEl.setAttribute("x", 0);
        mainRectEl.setAttribute("y", 0);
        mainRectEl.setAttribute("width", rect.width * scale);
        mainRectEl.setAttribute("height", rect.height * scale);
        const brightness = (i / rectangles.length) * brightnessRange + (1 - brightnessRange);
        mainRectEl.setAttribute("fill", `hsl(0, 0%, ${brightness * 100}%)`); // Colors in increasing darkness
        mainSvg.appendChild(mainRectEl);

        if (rect.cuts && rect.cuts.length > 0) {
            let cutOffset = 0;
            rect.cuts.forEach((cutRect, j) => {
                const cutBrightness = (j / rect.cuts.length) * cutBrightnessRange + (1 - cutBrightnessRange);
                const cutSvg = document.createElementNS(svgNS, "svg");
                const cutRectEl = document.createElementNS(svgNS, "rect");
                cutSvg.setAttribute("x", cutOffset);
                cutSvg.setAttribute("y", 0);
                cutSvg.setAttribute("width", cutRect.width * scale);
                cutSvg.setAttribute("height", cutRect.height * scale);
                cutRectEl.setAttribute("width", cutRect.width * scale);
                cutRectEl.setAttribute("height", cutRect.height * scale);
                cutRectEl.setAttribute("fill", `rgba(${cutBrightness * 255}, 0, 0, 0.5)`); // Increasing semi-transparent pink color
                cutRectEl.setAttribute("x", 0);
                cutRectEl.setAttribute("y", 0);
                cutSvg.appendChild(cutRectEl);
                mainSvg.appendChild(cutSvg);
                cutOffset += cutRect.width * scale;
            });
        }

        const textEl = document.createElementNS(svgNS, "text");
        textEl.setAttribute("x", (rect.width * scale) / 2);
        textEl.setAttribute("y", (rect.height * scale) / 2);
        textEl.setAttribute("font-size", "18px");
        textEl.setAttribute("text-anchor", "middle");
        textEl.setAttribute("alignment-baseline", "middle");
        textEl.textContent = `${rect.width} x ${rect.height}`;
        mainSvg.appendChild(textEl);

        container.appendChild(mainSvg);
    });

    return container;
}

function correctOrientation(rectangles) {
    rectangles.forEach(rect => {
        if (rect.width > rect.height) {
            const temp = rect.height;
            rect.height = rect.width;
            rect.width = temp;
        }
    });
    return rectangles;
}

function sortDimensions(rectangles, ascending = true) {
    return ascending ? rectangles.sort((a, b) => a.height * a.width - b.height * b.width) : rectangles.sort((a, b) => b.height * b.width - a.height * a.width);
}
