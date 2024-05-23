const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const query = urlParams.get('q');
const initial = urlParams.get('initial');
document.getElementById("header").href = initial;

let request = indexedDB.open('ProofDatabase');
var first;
var second;
var recommendationList;

let clickedTheoremExpressionRectangle = 0;
let clickedHypothesesInformationRectangle = 0;
let rect;
let isDragging = false;
let draggingObject = null;
let offsetXSub;
let offsetYSub;
let offsetX;
let offsetY;
let textLines = [];
let prevIndex = -1;

var drawnObjects = [];
var step;
var canvas;
var ctx;


function startCanvas(step) {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	canvas.addEventListener('click', clickFigures);
	window.addEventListener('resize', resizeCanvas);
	canvas.addEventListener('mousemove', mousemoveFigures);
	
	
	canvas.addEventListener('mousedown', addMousedownAll);
	canvas.addEventListener('mousemove', addMousemoveAll);
	canvas.addEventListener('mouseup', addMouseupAll);
	
	drawStepCircle(ctx, step);
	if (second.referenceList[step-1] !== "Nėra.") {
		drawTheoremRectangle(200, 10, "#A768E9", ctx, step);
		drawTheoremExpressionRectangle(200, 210, "#F19FFD", ctx, step);
		drawTheoremNameRectangle(canvas.width - 300, 110, "#A768E9", ctx, step);
		let theorem = drawnObjects.filter((rect) => rect.type === "TheoremRectangle")[0];
		let theoremExpression = drawnObjects.filter((rect) => rect.type === "TheoremExpressionRectangle")[0];
		
		drawArrow(ctx, theorem.x + theorem.width/2, theorem.y + theorem.height, theoremExpression.x + theoremExpression.width/2, theoremExpression.y);
	}
	
	
	let allLength = 0;
	if (second.hypList[step-1] !== "Hipotezių nėra.") {
		drawHypothesesNameRectangle(canvas.width - 300, 450, "#68C0E9", ctx, step)
		for (let i = 0; i < second.hypListList[step-1].length; i++) {	
			if (i === 0) {
				drawHypothesesRectangle(50, 350, "#68C0E9", ctx, step, i);
				drawHypothesesExpressionRectangle(50, 550, "#4D8BBE", ctx, step, i);
				let hypotheses = drawnObjects.filter((rect) => rect.type === "HypothesesRectangle"+i)[0];
				let hypothesesExpression = drawnObjects.filter((rect) => rect.type === "HypothesesExpressionRectangle"+i)[0];
				drawArrow(ctx, hypotheses.x + hypotheses.width/2, hypotheses.y + hypotheses.height, hypothesesExpression.x + hypothesesExpression.width/2, hypothesesExpression.y);
				allLength += 50;
			} else {
				let b = i - 1;
				let hypothesesExpressionPrev = drawnObjects.filter((rect) => rect.type === "HypothesesExpressionRectangle" + b)[0];
				drawHypothesesRectangle(allLength + hypothesesExpressionPrev.width + 50, 350, "#68C0E9", ctx, step, i);
				drawHypothesesExpressionRectangle(allLength + hypothesesExpressionPrev.width + 50, 550, "#4D8BBE", ctx, step, i);
				hypotheses = drawnObjects.filter((rect) => rect.type === "HypothesesRectangle"+i)[0];
				hypothesesExpression = drawnObjects.filter((rect) => rect.type === "HypothesesExpressionRectangle"+i)[0];
				drawArrow(ctx, hypotheses.x + hypotheses.width/2, hypotheses.y + hypotheses.height, hypothesesExpression.x + hypothesesExpression.width/2, hypothesesExpression.y);
				allLength += hypothesesExpressionPrev.width + 50;
			}
		}
	}

	
	changeCanvas(step);
}

function changeCanvas(step) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	if (drawnObjects.filter((rect) => rect.type === "SubstitutionRectangle").length !== 0) {
		drawTheoremSubstitutionRectangle(rect, textLines);
	}
	
	let theoremRectangle;
	let theoremExpressionRectangle;
	let theoremNameRectangle;
	var hypothesesNameRectangle;
	var hypothesesRectangle;
	var hypothesesExpressionRectangle;
	
	if (second.referenceList[step-1] !== "Nėra.") {
		theoremRectangle = drawnObjects.filter((rect) => rect.type === "TheoremRectangle")[0];
		theoremExpressionRectangle = drawnObjects.filter((rect) => rect.type === "TheoremExpressionRectangle")[0];
		theoremNameRectangle = drawnObjects.filter((rect) => rect.type === "TheoremNameRectangle")[0];
	}
	
	if (second.hypList[step-1] !== 'Hipotezių nėra.') {
		hypothesesNameRectangle = drawnObjects.filter((rect) => rect.type === "HypothesesNameRectangle")[0];
		hypothesesRectangle = drawnObjects.filter((rect) => rect.type.startsWith("HypothesesRectangle")).sort(sortDrawnObjects);
		hypothesesExpressionRectangle = drawnObjects.filter((rect) => rect.type.startsWith("HypothesesExpressionRectangle")).sort(sortDrawnObjects);
	}
	
	
	drawStepCircle(ctx, step);
	if (second.referenceList[step-1] !== "Nėra.") {
		drawTheoremRectangle(theoremRectangle.x, theoremRectangle.y, theoremRectangle.color, ctx, step);
		drawTheoremExpressionRectangle(theoremExpressionRectangle.x, theoremExpressionRectangle.y, theoremExpressionRectangle.color, ctx, step);
		drawTheoremNameRectangle(theoremNameRectangle.x, theoremNameRectangle.y, theoremNameRectangle.color, ctx, step);
		if (theoremRectangle.y < theoremExpressionRectangle.y) {
			drawArrow(ctx, theoremRectangle.x + theoremRectangle.width/2, theoremRectangle.y + theoremRectangle.height, theoremExpressionRectangle.x + theoremExpressionRectangle.width/2, theoremExpressionRectangle.y);
		} else {
			drawArrow(ctx, theoremRectangle.x + theoremRectangle.width/2, theoremRectangle.y, theoremExpressionRectangle.x + theoremExpressionRectangle.width/2, theoremExpressionRectangle.y + theoremExpressionRectangle.height);
		}
	}

	if (second.hypList[step-1] !== 'Hipotezių nėra.') {
		drawHypothesesNameRectangle(hypothesesNameRectangle.x, hypothesesNameRectangle.y, hypothesesNameRectangle.color, ctx, step)
		for (let i = 0; i < second.hypListList[step-1].length; i++) {
			drawHypothesesRectangle(hypothesesRectangle[i].x, hypothesesRectangle[i].y, hypothesesRectangle[i].color, ctx, step, i);
			drawHypothesesExpressionRectangle(hypothesesExpressionRectangle[i].x, hypothesesExpressionRectangle[i].y, hypothesesExpressionRectangle[i].color, ctx, step, i);
			if (hypothesesRectangle[i].y < hypothesesExpressionRectangle[i].y) {
				drawArrow(ctx, hypothesesRectangle[i].x + hypothesesRectangle[i].width/2, hypothesesRectangle[i].y + hypothesesExpressionRectangle[i].height, hypothesesExpressionRectangle[i].x + hypothesesExpressionRectangle[i].width/2, hypothesesExpressionRectangle[i].y);
			} else {
				drawArrow(ctx, hypothesesRectangle[i].x + hypothesesRectangle[i].width/2, hypothesesRectangle[i].y, hypothesesExpressionRectangle[i].x + hypothesesExpressionRectangle[i].width/2, hypothesesExpressionRectangle[i].y + hypothesesExpressionRectangle[i].height);
			}
		}
	}
}





function drawStepCircle(ctx, step) {
	var centerX = 60;
	var centerY = 60;
	var radius = 50;

	var textFont = "52px Arial";

	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
	ctx.fillStyle = "lightblue";
	ctx.fill();
	ctx.strokeStyle = "blue";
	ctx.lineWidth = 2;
	ctx.stroke();

	ctx.font = textFont;
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(step, centerX, centerY);
	
	//drawnObjects.push({ type: "StepCircle", x: centerX, y: centerY, radius: radius, color: "lightblue" });
}

function drawTheoremNameRectangle(x, y, color, ctx, step) {
	ctx.font = "40px Arial";
	let padding = 10;
	
	var textMetrics = ctx.measureText("Teoremos.");
	var textWidth = textMetrics.width;
	var textHeight = ctx.measureText('M').width; //the width of the letter 'M' is approximately the height of the text
	
	var rectWidth = textWidth + 2 * padding;
	var rectHeight = textHeight + 2 * padding;

	ctx.fillStyle = color;
	ctx.fillRect(x, y, rectWidth, rectHeight);

	ctx.fillStyle = "black";
	ctx.fillText("Teoremos.", x + textWidth/2 + padding, y + textHeight/2 + padding);
	
	if (drawnObjects.filter(obj => obj.type === "TheoremNameRectangle").length === 0) {
		drawnObjects.push({ type: "TheoremNameRectangle", x: x, y: y, width: rectWidth, height: rectHeight, color: color });
	}
    
}

function drawTheoremRectangle(x, y, color, ctx, step) {

	ctx.font = "40px Arial";
	let padding = 10;

	var textMetrics = ctx.measureText(second.referenceList[step-1]);
	var textWidth = textMetrics.width;
	var textHeight = ctx.measureText('M').width; //the width of the letter 'M' is approximately the height of the text

	var rectWidth = textWidth + 2 * padding;
	var rectHeight = textHeight + 2 * padding;

	ctx.fillStyle = color;
	ctx.fillRect(x, y, rectWidth, rectHeight);

	ctx.fillStyle = "black";
	ctx.fillText(second.referenceList[step-1], x + textWidth/2 + padding, y + textHeight/2 + padding);
	
	if (drawnObjects.filter(obj => obj.type === "TheoremRectangle").length === 0) {
		drawnObjects.push({ type: "TheoremRectangle", x: x, y: y, width: rectWidth, height: rectHeight, color: color });
	}
    
}

function drawTheoremExpressionRectangle(x, y, color, ctx, step) {
    ctx.font = "40px Arial";
	let padding = 10;

	var textMetrics = ctx.measureText(second.expressionList[step-1]);
	var textWidth = textMetrics.width;
	var textHeight = ctx.measureText('M').width; //the width of the letter 'M' is approximately the height of the text

	var rectWidth = textWidth + 2 * padding;
	var rectHeight = textHeight + 2 * padding;

	ctx.fillStyle = color;
	ctx.fillRect(x, y, rectWidth, rectHeight);

	ctx.fillStyle = "black";
	ctx.fillText(second.expressionList[step-1], x + textWidth/2 + padding, y + textHeight/2 + padding);
	
	if (drawnObjects.filter(obj => obj.type === "TheoremExpressionRectangle").length === 0) {
		drawnObjects.push({ type: "TheoremExpressionRectangle", x: x, y: y, width: rectWidth, height: rectHeight, color: color });
	}
    
}

function drawHypothesesNameRectangle(x, y, color, ctx, step) {
	ctx.font = "40px Arial";
	let padding = 10;
	
	var textMetrics = ctx.measureText("Hipotezės.");
	var textWidth = textMetrics.width;
	var textHeight = ctx.measureText('M').width; //the width of the letter 'M' is approximately the height of the text
	
	var rectWidth = textWidth + 2 * padding;
	var rectHeight = textHeight + 2 * padding;

	ctx.fillStyle = color;
	ctx.fillRect(x, y, rectWidth, rectHeight);

	ctx.fillStyle = "black";
	ctx.fillText("Hipotezės.", x + textWidth/2 + padding, y + textHeight/2 + padding);
	
	if (drawnObjects.filter(obj => obj.type === "HypothesesNameRectangle").length === 0) {
		drawnObjects.push({ type: "HypothesesNameRectangle", x: x, y: y, width: rectWidth, height: rectHeight, color: color });
	}
    
}

function drawHypothesesRectangle(x, y, color, ctx, step, i) {
	ctx.font = "40px Arial";
	let padding = 10;

	var textMetrics = ctx.measureText(second.hypListList[step-1][i]);
	var textWidth = textMetrics.width;
	var textHeight = ctx.measureText('M').width; //the width of the letter 'M' is approximately the height of the text

	var rectWidth = textWidth + 2 * padding;
	var rectHeight = textHeight + 2 * padding;

	ctx.fillStyle = color;
	ctx.fillRect(x, y, rectWidth, rectHeight);

	ctx.fillStyle = "black";
	ctx.fillText(second.hypListList[step-1][i], x + textWidth/2 + padding, y + textHeight/2 + padding);
	
	if (drawnObjects.filter(obj => obj.type === "HypothesesRectangle" + i).length === 0) {
		drawnObjects.push({ type: "HypothesesRectangle" + i, x: x, y: y, width: rectWidth, height: rectHeight, color: color });
	}
    
}

function drawHypothesesExpressionRectangle(x, y, color, ctx, step, i) {
	ctx.font = "40px Arial";
	let padding = 10;

	var textMetrics = ctx.measureText(second.hypExpressionListList[step-1][i]);
	var textWidth = textMetrics.width;
	var textHeight = ctx.measureText('M').width; //the width of the letter 'M' is approximately the height of the text

	var rectWidth = textWidth + 2 * padding;
	var rectHeight = textHeight + 2 * padding;

	ctx.fillStyle = color;
	ctx.fillRect(x, y, rectWidth, rectHeight);

	ctx.fillStyle = "black";
	ctx.fillText(second.hypExpressionListList[step-1][i], x + textWidth/2 + padding, y + textHeight/2 + padding);
	
	if (drawnObjects.filter(obj => obj.type === "HypothesesExpressionRectangle" + i).length === 0) {
		drawnObjects.push({ type: "HypothesesExpressionRectangle" + i, x: x, y: y, width: rectWidth, height: rectHeight, color: color, i: i });
	}
    
}

function drawArrow(ctx, fromX, fromY, toX, toY) {
    const headLength = 15; // length of head in pixels
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.strokeStyle = "#3BF116";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
	
	
	//if (drawnObjects.filter(obj => obj.type === "Arrow")) {
	//	drawnObjects.push({ type: "Arrow", fromX: fromX, fromY: fromY, toX: toX,  toY:  toY, color: "#3BF116" });
	//}

}

function drawTheoremSubstitutionRectangle(rect, textLines) {
	ctx.fillStyle = "blue";
	ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
	
	
	ctx.font = "30px Arial";
	ctx.fillStyle = "white";
	
	if (textLines.length !== 1) {
		textLines.forEach((line, index) => {
			if (index == 0) {
				const textX = rect.x + rect.width/2;
				const textY = rect.y + 30;
				ctx.fillText(line, textX, textY);
			} else {
				const textX = rect.x + rect.width/2;
				const textY = rect.y + 50 + index * 40;
				ctx.fillText(line, textX, textY);
			}
		});
	} else {
		textLines.forEach((line, index) => {
			const textX = rect.x + rect.width/2;
			const textY = rect.y + 30 + index * 40;
			ctx.fillText(line, textX, textY);
		});
	}

	//if (drawnObjects.filter(obj => obj.type === "SubstitutionRectangle")[0].length === 0) {
		drawnObjects.push({ type: "SubstitutionRectangle", x: rect.x, y: rect.y, width: rect.width, height: rect.height, color: "blue" });
	//}
	
}




function isInsideRectangle(rect1, x, y) {
	return x > rect1.x && x < rect1.x + rect1.width && y > rect1.y && y < rect1.y + rect1.height;
}

function getObjectAt(x, y) {
    return drawnObjects.find(obj => {
		if (obj.type !== "SubstitutionRectangle" && obj.type !== "StepCircle" && obj.type !== "Arrow") {
			return x > obj.x && x < obj.x + obj.width && 
			y > obj.y && y < obj.y + obj.height;
		}
		return null;
    });
}

function sortDrawnObjects(a, b) {
	if (a.type < b.type){
		return -1;
	}
	if (a.type > b.type){
		return 1;
	}
	return 0;
}




function addMousedownAll(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const obj = getObjectAt(mouseX, mouseY);
    if (obj) {
        draggingObject = obj;
        offsetX = mouseX - obj.x;
        offsetY = mouseY - obj.y;
    }
}

function addMousemoveAll(event) {
    if (draggingObject) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        draggingObject.x = mouseX - offsetX;
        draggingObject.y = mouseY - offsetY;

        changeCanvas(step);
    }
}

function addMouseupAll(event) {
    draggingObject = null;
}


function addMousedown(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    if (mouseX >= rect.x && mouseX <= rect.x + rect.width &&
        mouseY >= rect.y && mouseY <= rect.y + rect.height) {
        isDragging = true;
		offsetXSub = mouseX - rect.x;
        offsetYSub = mouseY - rect.y;
    }
	canvas.addEventListener('click', clickFigures);
}

function addMousemove(event) {
    if (isDragging) {
		canvas.removeEventListener('click', clickFigures);
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;

		rect.x = mouseX - offsetXSub;
		rect.y = mouseY - offsetYSub;
		changeCanvas(step);	
    }
}

function addMouseup(event) {
    isDragging = false;
}

function addMouseleave(event) {
    isDragging = false;
}

function addClick(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    if (mouseX >= rect.x && mouseX <= rect.x + rect.width &&
        mouseY >= rect.y && mouseY <= rect.y + rect.height) {
		changeCanvas(step);
    }
}



function clickFigures(event) {
    var rectBounds = canvas.getBoundingClientRect();
    var mouseX = event.clientX - rectBounds.left;
    var mouseY = event.clientY - rectBounds.top;
    drawnObjects.filter((rectangle) => rectangle.type === "TheoremExpressionRectangle").forEach((rectangle, index) => {
        if (isInsideRectangle(rectangle, mouseX, mouseY)) {
            canvas.removeEventListener("mousedown", addMousedown);
            canvas.removeEventListener("mousemove", addMousemove);
            canvas.removeEventListener("mouseup", addMouseup);
            canvas.removeEventListener("mouseleave", addMouseleave);
            canvas.removeEventListener("click", addClick);
			clickedHypothesesInformationRectangle = 0;
			prevIndex = -1;
            clickedTheoremExpressionRectangle += 1;

            if (clickedTheoremExpressionRectangle % 2 !== 0) {
                let padding = 10;
                textLines = [];
                if (second.substList[step-1] === "") {
                    textLines.push("Pakeitimų šiame žingsnyje nėra.");
                } else {
                    textLines.push("Žingsnio pakeitimai:");
                    textLines.push(...second.substList[step-1].split('\n'));
                }

                const longestString = textLines.reduce((longest, current) => {
                    return current.length > longest.length ? current : longest;
                }, "");

                ctx.font = "30px Arial";

                var textMetrics = ctx.measureText(longestString);
                var textWidth = textMetrics.width;
                var textHeight = ctx.measureText('M').width * textLines.length;
                var rectWidth = textWidth + textWidth / 8;
                var rectHeight = textHeight + textHeight + 10;
				
				let filtered = drawnObjects.filter((rectangle) => rectangle.type === "TheoremNameRectangle")[0];
				
                rect = { x: (window.innerWidth - rectWidth - filtered.width - 100), y: 10, width: rectWidth, height: rectHeight, textWidth: textWidth, textHeight: textHeight };

                canvas.addEventListener("mousedown", addMousedown);
                canvas.addEventListener("mousemove", addMousemove);
                canvas.addEventListener("mouseup", addMouseup);
                canvas.addEventListener("mouseleave", addMouseleave);
                canvas.addEventListener("click", addClick);

				changeCanvas(step);
                drawTheoremSubstitutionRectangle(rect, textLines);
            } else {
				drawnObjects = drawnObjects.filter((rectangle) => rectangle.type !== "SubstitutionRectangle");
                changeCanvas(step);
            }
        }
    });
	drawnObjects.filter((rectangle) => rectangle.type.startsWith("HypothesesExpressionRectangle")).sort().forEach((rectangle, index) => {
		if (isInsideRectangle(rectangle, mouseX, mouseY)) {
			clickedHypothesesInformationRectangle = 0;
			if (prevIndex === index) {
				prevIndex = -1;
				clickedHypothesesInformationRectangle = 0;
			} else {
				prevIndex = index;
				clickedHypothesesInformationRectangle += 1;
			}
			
            canvas.removeEventListener("mousedown", addMousedown);
            canvas.removeEventListener("mousemove", addMousemove);
            canvas.removeEventListener("mouseup", addMouseup);
            canvas.removeEventListener("mouseleave", addMouseleave);
            canvas.removeEventListener("click", addClick);
			clickedTheoremExpressionRectangle = 0;
            
            if (clickedHypothesesInformationRectangle % 2 !== 0) {
                let padding = 10;
                textLines = [];
                if (second.substList[step-1] === "") {
                    textLines.push("Pakeitimų šiame žingsnyje nėra.");
                } else {
                    textLines.push("Žingsnio pakeitimai:");
                    textLines.push(...second.substList[step-1].split('\n'));
                }

				textLines.push("");
				textLines.push(second.hypExpressionListList[step-1][index]);
				if (second.hypStepNumber[step-1][index] !== undefined) {
					textLines.push("Hipotezės nuoroda į " + second.hypStepNumber[step-1][index] + " žingsnį.");
				} else {
					textLines.push("Hipotezė yra įrodinėjamos teoremos dalis.");
				}
				
                const longestString = textLines.reduce((longest, current) => {
                    return current.length > longest.length ? current : longest;
                }, "");

                ctx.font = "30px Arial";

                var textMetrics = ctx.measureText(longestString);
                var textWidth = textMetrics.width;
                var textHeight = ctx.measureText('M').width * textLines.length;
                var rectWidth = textWidth + textWidth / 8;
                var rectHeight = textHeight + textHeight;
				
				let filtered = drawnObjects.filter((rectangle) => rectangle.type === "HypothesesNameRectangle")[0];
				
                rect = { x: (window.innerWidth - rectWidth - filtered.width - 100), y: 180, width: rectWidth, height: rectHeight };

                canvas.addEventListener("mousedown", addMousedown);
                canvas.addEventListener("mousemove", addMousemove);
                canvas.addEventListener("mouseup", addMouseup);
                canvas.addEventListener("mouseleave", addMouseleave);
                canvas.addEventListener("click", addClick);
				
				
				changeCanvas(step);
				drawTheoremSubstitutionRectangle(rect, textLines);
            } else {
				drawnObjects = drawnObjects.filter((rectangle) => rectangle.type !== "SubstitutionRectangle");
				changeCanvas(step);	
            }
        }
    });
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
	changeCanvas(step);
}

function mousemoveFigures(event) {
	var rect1 = canvas.getBoundingClientRect();
	var mouseX = event.clientX - rect1.left;
	var mouseY = event.clientY - rect1.top;

	let hovering = false;
	let relevantObjects = drawnObjects.filter((rectangle) => rectangle.type === "TheoremExpressionRectangle" || rectangle.type.startsWith("HypothesesExpressionRectangle"));
	drawnObjects.filter((rectangle) => rectangle.type === "TheoremExpressionRectangle" || rectangle.type.startsWith("HypothesesExpressionRectangle")).sort(sortDrawnObjects).forEach((rect2, index) => {
		if (isInsideRectangle(rect2, mouseX, mouseY)) {
			if (rect2.type === "TheoremExpressionRectangle") {
				let changingRect = drawnObjects.filter((rectangle) => rectangle.type === "TheoremExpressionRectangle")[0];
				changingRect.color = "#A2F9BD";
				changeCanvas(step);
				hovering = true;
			}
			if (rect2.type === "HypothesesExpressionRectangle" + rect2.i) {
				let changingRect = drawnObjects.filter((rectangle) => rectangle.type === "HypothesesExpressionRectangle" + rect2.i)[0];
				changingRect.color = "#A2F9BD";
				changeCanvas(step);
				drawnObjects = drawnObjects.sort(sortDrawnObjects);
				hovering = true;
			}
		}
	});
	
	if (!relevantObjects.some((obj) => isInsideRectangle(obj, mouseX, mouseY))) {
		let changingTheoremExpressionRectangle = drawnObjects.filter((rectangle) => rectangle.type === "TheoremExpressionRectangle").forEach((rectangle) => {
			rectangle.color = "#F19FFD";
		});
		
		let changingHypothesesExpressionRectangle = drawnObjects.filter((rectangle) => rectangle.type.startsWith("HypothesesExpressionRectangle")).forEach((rectangle) => {
			rectangle.color = "#4D8BBE";
		});
		changeCanvas(step);
	}
	
	if (hovering) {
		canvas.style.cursor = 'pointer';
	} else {
		canvas.style.cursor = 'default';
	}
}



document.getElementById("container1").addEventListener("click", function() {
    window.location.href = "search.html?initial=" + initial;
});

document.getElementById("container2").addEventListener("click", function() {
	step = 1;
	clickedTheoremExpressionRectangle = 0;
	clickedHypothesesInformationRectangle = 0;
	drawnObjects.length = 0;


	$(".table").remove();
	if (!$(".box1").length) {
		var newElement1 = $(
		"<div class=\"container2\"> \
			<div id=\"container4\" class=\"box1 click\"> \
				<b class=\"not-selectable\">Ankstesnis žingsnis</b> \
			</div> \
			<div id=\"container5\" class=\"box1 click\"> \
				<b class=\"not-selectable\">Sekantis žingsnis</b> \
			</div> \
			<div id=\"container6\" class=\"box1\"> \
				<b id=\"pageOf\" class=\"not-selectable\">" + "Dabartinis žingsnis " + step + " / "+ second.expressionList.length + "</b> \
			</div> \
		</div>");
		$("body").append(newElement1);
		newElement1.hide();
		$(newElement1).fadeIn(1000);
		
		var newSearchElement = $(
			"<div id=\"searchContainer\" class=\"line\"> \
				<input type=\"text\" id=\"pageSearchBar\" placeholder=\"Eiti prie žingsnio...\"> \
				<div id=\"recommendationList\"></div> \
			</div>");
		$(".container").append(newSearchElement);
		newSearchElement.hide();
		$(newSearchElement).fadeIn(1000);
		
		
		if (step === 1) {
			$("#container4").css('visibility', 'hidden');
		}
		if (step === second.expressionList.length) {
			$("#container5").css('visibility', 'hidden');
		}
		document.getElementById('pageSearchBar').removeEventListener('input', findTheorem);
		document.getElementById('pageSearchBar').removeEventListener('keypress', keyPressed);
		
		document.getElementById('pageSearchBar').addEventListener('input', findTheorem);
		document.getElementById('pageSearchBar').addEventListener('keypress', keyPressed);
		
		document.getElementById("container4").addEventListener("click", function() {
			clickedTheoremExpressionRectangle = 0;
			clickedHypothesesInformationRectangle = 0;
			drawnObjects.length = 0;
			if (step > 1) {
				$("#canvas").remove();
				var newElement2 = $("<canvas id=\"canvas\"></canvas>");
				$("body").append(newElement2);
				newElement2.hide();
				$(newElement2).fadeIn('slow');
				startCanvas(--step);
			}
			if (step === 1) {
				$("#container4").css('visibility', 'hidden');
			} 
			if (step !== second.expressionList.length) {
				$("#container5").css('visibility', 'visible');
			}
			document.getElementById("pageOf").innerHTML = "Dabartinis žingsnis " + step + " / "+ second.expressionList.length;
		});
		document.getElementById("container5").addEventListener("click", function() {
			clickedTheoremExpressionRectangle = 0;
			clickedHypothesesInformationRectangle = 0;
			drawnObjects.length = 0;
			if (step < second.expressionList.length) {
				$("#canvas").remove();
				var newElement2 = $("<canvas id=\"canvas\"></canvas>");
				$("body").append(newElement2);
				newElement2.hide();
				$(newElement2).fadeIn('slow');
				startCanvas(++step);
			}
			if (step === second.expressionList.length) {
				$("#container5").css('visibility', 'hidden');
			}
			if (step !== 1) {
				$("#container4").css('visibility', 'visible');
			}
			document.getElementById("pageOf").innerHTML = "Dabartinis žingsnis " + step + " / "+ second.expressionList.length;
		});
	}
	if (!$("#canvas").length) {
		var newElement2 = $("<canvas id=\"canvas\"></canvas>");
		$("body").append(newElement2);
		newElement2.hide();
		$(newElement2).fadeIn('slow');
		
		startCanvas(step);
	} else {
		$("#canvas").remove();
		var newElement2 = $("<canvas id=\"canvas\"></canvas>");
		$("body").append(newElement2);
		newElement2.hide();
		$(newElement2).fadeIn('slow');
		
		startCanvas(step);
	}
});

document.getElementById("container3").addEventListener("click", function() {
	$(".container2").remove();
	$("#canvas").remove();
	$("#searchContainer").remove();
	if (!$(".table").length) {
		var table = $("<div class=\"table\"><table id=\"table1\"></table></div>");
		$("body").append(table);
		var headerRow = $('<tr><th id="tableHeader" colspan="7"></th></tr>').hide();
		$('#table1').append(headerRow);
		$(headerRow).fadeIn('slow');
		document.getElementById('tableHeader').innerHTML = 'Įrodymas ' + first.provingExpression + ' teoremos';
		document.getElementById('tableHeader').style.backgroundColor = 'yellow';
		var headersRow = $('<tr><th>Žingsnis</th><th>Hipotezių žingsniai</th><th>Hipotezės</th><th>Teorema</th><th>Pakeitimas (angl. substitution)</th><th>Hipotezių reiškiniai</th><th>Galutinis reiškinys</th></tr>').hide();
		$('#table1').append(headersRow);
		$(headersRow).fadeIn('slow');
		
		for (let counter = 1; counter <= first.resultList.length; counter++) {
			var newRow = $('<tr><td id="step' +
				counter + '"></td><td id="hypstep' +
				counter + '"></td><td id="hyp' +
				counter + '"></td><td id="ref' +
				counter + '"></td><td id="subs' +
				counter + '"></td><td id="hypexp' +
				counter + '"></td><td id="result' +
				counter + '"></td></tr>').hide();
			$('#table1').append(newRow);
			$(newRow).fadeIn('slow');
			document.getElementById('step'+counter).innerHTML = counter;
			document.getElementById('hypstep'+counter).innerHTML = second.hypStepNumber[counter-1];
			document.getElementById('hyp'+counter).innerHTML = second.hypList[counter-1];
			document.getElementById('ref'+counter).innerHTML = second.referenceList[counter-1];
			document.getElementById('subs'+counter).innerHTML = second.substList[counter-1];
			document.getElementById('hypexp'+counter).innerHTML = second.hypExpressionList[counter-1];
			document.getElementById('result'+counter).innerHTML = second.expressionList[counter-1];
		}
	}
});


function keyPressed(event) {
	if (event.key === 'Enter') {
		const recommendationList = document.getElementById('recommendationList');
        let query = event.target.value;
		let number = Number(query);
		if (Number.isInteger(number)) {
			if (number > 0 && number <= second.expressionList.length) {
				step = number;
				clickedTheoremExpressionRectangle = 0;
				clickedHypothesesInformationRectangle = 0;
				drawnObjects.length = 0;
				$("#canvas").remove();
				var newElement2 = $("<canvas id=\"canvas\"></canvas>");
				$("body").append(newElement2);
				newElement2.hide();
				$(newElement2).fadeIn('slow');
				startCanvas(step);
				if (step === 1) {
					$("#container4").css('visibility', 'hidden');
				} 
				if (step !== 1) {
					$("#container4").css('visibility', 'visible');
				}
				if (step !== second.expressionList.length) {
					$("#container5").css('visibility', 'visible');
				} 
				if (step === second.expressionList.length) {
					$("#container5").css('visibility', 'hidden');
				}
				document.getElementById("pageOf").innerHTML = "Dabartinis žingsnis " + step + " / " + second.expressionList.length;
				document.getElementById('pageSearchBar').value = step;
				recommendationList.style.display = 'none';
			}
		} 
    }
}

function findTheorem(event) {
	recommendationList = document.getElementById('recommendationList');
	let query = event.target.value;
	let number = Number(query);
	if (Number.isInteger(number)) {
		recommendationList.innerHTML = '';
		if (query.length === 0) {
			recommendationList.style.display = 'none';
			return;
		}
		
		let filteredRecommendation = [...Array(second.expressionList.length).keys()].map((elem) => elem + 1)
																					.filter((elem) => number === elem);																		
		if (filteredRecommendation.length > 0) {
			const div = document.createElement('div');
			div.className = 'recommendationItem';
			div.textContent = second.expressionList[number-1];
			recommendationList.appendChild(div);
			recommendationList.style.display = 'block';
		} else {
			recommendationList.style.display = 'none';
		}													
	}
}



class Proof {
	constructor() {
		this.label = "";
		this.hypList = [];
		this.hypListList = [];
		this.referenceList = [];
		this.substList = [];
		this.hypExpressionList = [];
		this.hypExpressionListList = [];
		this.expressionList = [];
		this.hypStepNumber = [];
	}
}

function fillData(data) {
	var proof = new Proof();
	proof.label = data.label;
	data.provingExpression.forEach((item, index) => { if (item == '|-') data.provingExpression[index] = '\u22A2'; });
	data.provingExpression = data.provingExpression.join(' ');

	for (let m = 0; m < data.resultList.length; m++) {
		if (Array.isArray(data.resultList[m][3])) {
			let a = data.resultList[m][3];
			a.forEach((item, index) => { if (item == '->') a[index] = '\u2192'; });
			a.forEach((item, index) => { if (item == '|-') a[index] = '\u22A2'; });
			a.forEach((item, index) => { if (item == 'CC') a[index] = '\u2102'; });
			
			let expression = a.slice();
			for (let n = 0; n < expression.length; n++) {
				for (let l = 0; l < Object.keys(data.subsDict[m]).length; l++) {
					if (expression[n] === data.mandList[m][l][1]) {
						expression[n] = data.subsDict[m][data.mandList[m][l][1]].join(' ');
						break;
					}
				}
			}
			
			proof.expressionList.push(expression.join(' '));
			proof.referenceList.push(a.join(' '));
			var str1 = "";
			var str2 = "";
			if (data.resultList[m][2].length === 0) {
				proof.hypList.push("Hipotezių nėra.");
				proof.hypListList.push(["Hipotezių nėra."]);
				proof.hypExpressionList.push("------");
				proof.hypExpressionListList.push(["------"]);
			} else {
				for (let n = 0; n < data.resultList[m][2].length; n++) {
					data.resultList[m][2][n].forEach((item, index) => { if (item == '->') data.resultList[m][2][n][index] = '\u2192'; });
					data.resultList[m][2][n].forEach((item, index) => { if (item == '|-') data.resultList[m][2][n][index] = '\u22A2'; });
					data.resultList[m][2][n].forEach((item, index) => { if (item == 'CC') data.resultList[m][2][n][index] = '\u2102'; });
					
					let list = data.resultList[m][2][n].slice();
					for (let k = 0; k < list.length; k++) {
						for (let l = 0; l < Object.keys(data.subsDict[m]).length; l++) {
							if (list[k] === data.mandList[m][l][1]) {
								list[k] = data.subsDict[m][data.mandList[m][l][1]].join(' ');
								break;
							}
						}
					}
					var strH = list.join(' ');
					str2 = str2.concat('\n', strH);
					
					var str = data.resultList[m][2][n].join(' ');
					str1 = str1.concat('\n', str);
				}
				str1 = str1.substring(1);
				str2 = str2.substring(1);
				proof.hypList.push(str1);
				proof.hypListList.push(str1.split('\n'));
				proof.hypExpressionList.push(str2);
				proof.hypExpressionListList.push(str2.split('\n'));
			}
		} else {
			data.resultList[m].forEach((item, index) => { if (item == '->') data.resultList[m][index] = '\u2192'; });
			data.resultList[m].forEach((item, index) => { if (item == '|-') data.resultList[m][index] = '\u22A2'; });
			proof.referenceList.push("Nėra.");
			proof.hypList.push("Naudojama teoremos hipotezė.");
			proof.hypListList.push(["Naudojama teoremos hipotezė."]);
			proof.expressionList.push(data.resultList[m].join(' '));
			proof.hypExpressionList.push(data.resultList[m].join(' '));
			proof.hypExpressionListList.push([data.resultList[m].join(' ')]);
		}
	}
	for (let m = 0; m < data.resultList.length; m++) {
		if (Array.isArray(data.resultList[m][3])) {
			var str1 = "";
			for (let n = 0; n < Object.keys(data.subsDict[m]).length; n++) {
				data.subsDict[m][data.mandList[m][n][1]].forEach((item, index) => { if (item == '->') data.subsDict[m][data.mandList[m][n][1]][index] = '\u2192'; });
				var str = data.mandList[m][n][1] + " kintamasis keičiamas į " + data.subsDict[m][data.mandList[m][n][1]].join(' ');
				str1 = str1.concat('\n', str);
			}
			str1 = str1.substring(1);
			proof.substList.push(str1);
		} else {
			proof.substList.push('');
		}
	}
	
	let copiedArray = proof.expressionList.slice();
	for (let m = 0; m < data.resultList.length; m++) {
		if (Array.isArray(data.resultList[m][3])) {
			let steps = [];
			for (let n = 0; n < proof.hypExpressionListList[m].length; n++) {
				let indexToChange = 0;
				for (let b = 0; b < copiedArray.length; b++) {
					if (copiedArray[b] === proof.hypExpressionListList[m][n]) {
						steps.push(b + 1);
						indexToChange = b + 1;
						break;
					}
				}
				if (indexToChange !== 0) {
					copiedArray[indexToChange - 1] = "";
				}
			}
			proof.hypStepNumber.push(steps);
		} else {
			proof.hypStepNumber.push([]);
		}
	}
	first = data;
	second = proof;
}


request.onsuccess = function(event) {
    let db = event.target.result;
    
    let transaction = db.transaction('proofs', 'readonly');
    
    let objectStore = transaction.objectStore('proofs');
    
    let index = objectStore.index('label');
    
    let getRequest = index.get(query);
    
    getRequest.onsuccess = function(event) {
        let data = event.target.result;
        if (data) {
			fillData(data);
			document.getElementById('changetheorem').innerHTML = 'Pereiti prie kitos teoremos nuo ' + first.label;
        } else {
            console.error('No data found with the specified index key');
        }
    };
    
    transaction.oncomplete = function(event) {
        
    };
    
    transaction.onerror = function(event) {
        console.error('Transaction error:', event.target.error);
    };
};

request.onerror = function(event) {
    console.error('Database open error:', event.target.error);
};