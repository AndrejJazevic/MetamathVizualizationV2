const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const query = urlParams.get('q');


let request = indexedDB.open('ProofDatabase');
var first;
var second;

var drawnObjects = [];
var step;
var canvas;
var ctx;

function startCanvas(step) {
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	changeCanvas(step);
	
	canvas.addEventListener('click', handleClick);
	window.addEventListener('resize', resizeCanvas);
	canvas.addEventListener('mousemove', mousemoveFigures);

}

function changeCanvas(step) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawnObjects = drawnObjects.filter((rectangle) => rectangle.type === "SubstitutionRectangle");
	
	
	drawStepCircle(ctx, step);
	drawTheoremRectangle(200, 10, "#A768E9", ctx, step);
	drawTheoremExpressionRectangle(200, 210, "#F19FFD", ctx, step);
	drawTheoremNameRectangle(canvas.width - 300, 110, "#A768E9", ctx, step);
	let allLength = 0;
	if (second.hypList[step-1] !== 'Hipotezių nėra.') {
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
	
	
	let theorem = drawnObjects.filter((rect) => rect.type === "TheoremRectangle")[0];
	let theoremExpression = drawnObjects.filter((rect) => rect.type === "TheoremExpressionRectangle")[0];
	
	drawArrow(ctx, theorem.x + theorem.width/2, theorem.y + theorem.height, theoremExpression.x + theoremExpression.width/2, theoremExpression.y);
	
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
	
	drawnObjects.push({ type: "StepCircle", x: centerX, y: centerY, radius: radius, color: "lightblue" });
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
	
	
    drawnObjects.push({ type: "TheoremNameRectangle", x: x, y: y, width: rectWidth, height: rectHeight, color: color });
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
	
	
    drawnObjects.push({ type: "TheoremRectangle", x: x, y: y, width: rectWidth, height: rectHeight, color: color });
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
	
	
    drawnObjects.push({ type: "TheoremExpressionRectangle", x: x, y: y, width: rectWidth, height: rectHeight, color: color });
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
	
	
    drawnObjects.push({ type: "HypothesesNameRectangle", x: x, y: y, width: rectWidth, height: rectHeight, color: color });
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
	
	
    drawnObjects.push({ type: "HypothesesRectangle" + i, x: x, y: y, width: rectWidth, height: rectHeight, color: color });
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
	
	
    drawnObjects.push({ type: "HypothesesExpressionRectangle" + i, x: x, y: y, width: rectWidth, height: rectHeight, color: color });
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
    ctx.strokeStyle = '#3BF116';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

function drawTheoremSubstitutionRectangle(rect, textLines) {		
	let color = "blue"
	ctx.fillStyle = color;
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
	
	drawnObjects.push({ type: "SubstitutionRectangle", x: rect.x, y: rect.y, width: rect.width, height: rect.height, color: color });
}




function isInsideRectangle(rect1, x, y) {
	return x > rect1.x && x < rect1.x + rect1.width && y > rect1.y && y < rect1.y + rect1.height;
}

let clickedTheoremExpressionRectangle = 0;
let clickedHypothesesInformationRectangle = 0;
let rect;
let isDragging = false;
let textLines = [];
let prevIndex = -1;

function handleClick(event) {
	clickFigures(event, step, ctx);
}

function addMousedown(event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    if (mouseX >= rect.x && mouseX <= rect.x + rect.width &&
        mouseY >= rect.y && mouseY <= rect.y + rect.height) {
        isDragging = true;
    }
}

function addMousemove(event) {
    if (isDragging) {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;

        rect.x = mouseX - rect.width / 2;
        rect.y = mouseY - rect.height / 2;
		changeCanvas(step);
        drawTheoremSubstitutionRectangle(rect, textLines);
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
        drawTheoremSubstitutionRectangle(rect, textLines);
    }
}


function clickFigures(event, step, ctx) {
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
                var rectWidth = textWidth + textWidth / 2;
                var rectHeight = textHeight + textHeight + 10;
				
				let filtered = drawnObjects.filter((rectangle) => rectangle.type === "TheoremNameRectangle")[0];
				
                rect = { x: (window.innerWidth - rectWidth - filtered.width - 100), y: 10, width: rectWidth, height: rectHeight };

                canvas.addEventListener("mousedown", addMousedown);
                canvas.addEventListener("mousemove", addMousemove);
                canvas.addEventListener("mouseup", addMouseup);
                canvas.addEventListener("mouseleave", addMouseleave);
                canvas.addEventListener("click", addClick);

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
            
			console.log(clickedTheoremExpressionRectangle);
			console.log(prevIndex);
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
				textLines.push("Hipotezės nuoroda į " + second.hypStepNumber[step-1][index] + " žingsnį.");

                const longestString = textLines.reduce((longest, current) => {
                    return current.length > longest.length ? current : longest;
                }, "");

                ctx.font = "30px Arial";

                var textMetrics = ctx.measureText(longestString);
                var textWidth = textMetrics.width;
                var textHeight = ctx.measureText('M').width * textLines.length;
                var rectWidth = textWidth + textWidth / 2;
                var rectHeight = textHeight + textHeight;
				
				let filtered = drawnObjects.filter((rectangle) => rectangle.type === "TheoremNameRectangle")[0];
				
                rect = { x: (window.innerWidth - rectWidth - filtered.width - 100), y: 180, width: rectWidth, height: rectHeight };

                canvas.addEventListener("mousedown", addMousedown);
                canvas.addEventListener("mousemove", addMousemove);
                canvas.addEventListener("mouseup", addMouseup);
                canvas.addEventListener("mouseleave", addMouseleave);
                canvas.addEventListener("click", addClick);

                drawTheoremSubstitutionRectangle(rect, textLines);
            } else {
				console.log(drawnObjects);
				drawnObjects = drawnObjects.filter((rectangle) => rectangle.type !== "SubstitutionRectangle");
				console.log(drawnObjects);
				changeCanvas(step);	
            }
        }
    });
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
	let filtered = drawnObjects.filter((rectangle) => rectangle.type === "SubstitutionRectangle");
	if (filtered.length !== 0) {
		clickedTheoremExpressionRectangle = 0;
		clickedHypothesesInformationRectangle = 0;
	}
	changeCanvas(step);
}

function mousemoveFigures(event) {
	var rect1 = canvas.getBoundingClientRect();
	var mouseX = event.clientX - rect1.left;
	var mouseY = event.clientY - rect1.top;

	let hovering = false;
	drawnObjects.filter((rectangle) => rectangle.type === "TheoremExpressionRectangle").forEach(rect2 => {
		if (isInsideRectangle(rect2, mouseX, mouseY)) {
			console.log("yeah");
			changeCanvas(step);
			drawnObjects = drawnObjects.filter((rectangle) => rectangle.type !== "TheoremExpressionRectangle");
			
			drawTheoremExpressionRectangle(rect2.x, rect2.y, "#A2F9BD", ctx, step);
			drawnObjects.forEach(obj => {
			    if (obj.type === 'SubstitutionRectangle') {
					drawnObjects = drawnObjects.filter((rectangle) => rectangle.type !== "SubstitutionRectangle");
					drawTheoremSubstitutionRectangle(rect, textLines);
				}
			});
			console.log(drawnObjects);
			hovering = true;
		} else {
			changeCanvas(step);
			drawnObjects = drawnObjects.filter((rectangle) => rectangle.type !== "TheoremExpressionRectangle");
			drawTheoremExpressionRectangle(rect2.x, rect2.y, "#F19FFD", ctx, step);
			drawnObjects.forEach(obj => {
			    if (obj.type === 'SubstitutionRectangle') {
					drawnObjects = drawnObjects.filter((rectangle) => rectangle.type !== "SubstitutionRectangle");
					drawTheoremSubstitutionRectangle(rect, textLines);
				}
			});
		}
	});
	drawnObjects.filter((rectangle) => rectangle.type.startsWith("HypothesesExpressionRectangle")).sort().forEach((rect2, index) => {
		if (isInsideRectangle(rect2, mouseX, mouseY)) {
			//console.log(drawnObjects);
			changeCanvas(step);
			drawnObjects = drawnObjects.filter((rectangle) => rectangle.type !== "HypothesesExpressionRectangle" + index);
			drawHypothesesExpressionRectangle(rect2.x, rect2.y, "#A2F9BD", ctx, step, index);
			drawnObjects.forEach(obj => {
			    if (obj.type === 'SubstitutionRectangle') {
					drawnObjects = drawnObjects.filter((rectangle) => rectangle.type !== "SubstitutionRectangle");
					drawTheoremSubstitutionRectangle(rect, textLines);
				}
			});
			hovering = true;
		} else {
			//clickedHypothesesInformationRectangle = 0;
			changeCanvas(step);
			drawnObjects = drawnObjects.filter((rectangle) => rectangle.type !== "HypothesesExpressionRectangle" + index);
			console.log(drawnObjects);
			drawHypothesesExpressionRectangle(rect2.x, rect2.y, "#4D8BBE", ctx, step, index);
			drawnObjects.forEach(obj => {
			    if (obj.type === 'SubstitutionRectangle') {
					drawnObjects = drawnObjects.filter((rectangle) => rectangle.type !== "SubstitutionRectangle");
					drawTheoremSubstitutionRectangle(rect, textLines);
				}
			});
		}
	});

	if (hovering) {
		canvas.style.cursor = 'pointer';
	} else {
		canvas.style.cursor = 'default';
	}
}



document.getElementById("container1").addEventListener("click", function() {
    window.location.href = "search.html";
});

document.getElementById("container2").addEventListener("click", function() {
	step = 1;
	clickedTheoremExpressionRectangle = 0;
	clickedHypothesesInformationRectangle = 0;
	drawnObjects.length = 0;

	$(".table").remove();
	if (!$(".box1").length) {
		var newElement1 = $("<div class=\"container2\"><div id=\"container4\" class=\"box1\"><b class=\"not-selectable\">Ankstesnis žingsnis</b></div><div id=\"container5\" class=\"box1\"><b class=\"not-selectable\">Sekantis žingsnis</b></div></div>");
		$("body").append(newElement1);
		newElement1.hide();
		$(newElement1).fadeIn(1000);
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
	if (!$(".table").length) {
		var table = $("<div class=\"table\"><table id=\"table1\"></table></div>");
		$("body").append(table);
		var headerRow = $('<tr><th id="header" colspan="7"></th></tr>').hide();
		$('#table1').append(headerRow);
		$(headerRow).fadeIn('slow');
		document.getElementById('header').innerHTML = 'Įrodymas ' + first.provingExpression + ' teoremos';
		document.getElementById('header').style.backgroundColor = 'yellow';
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
		let a = data.resultList[m][3];
		a.forEach((item, index) => { if (item == '->') a[index] = '\u2192'; });
		a.forEach((item, index) => { if (item == '|-') a[index] = '\u22A2'; });
		a.forEach((item, index) => { if (item == 'CC') a[index] = '\u2102'; });
		proof.referenceList.push(a.join(' '));
		var str1 = "";
		if (data.resultList[m][2].length === 0) {
			proof.hypList.push("Hipotezių nėra.");
			proof.hypListList.push(["Hipotezių nėra."]);
		} else {
			for (let n = 0; n < data.resultList[m][2].length; n++) {
				data.resultList[m][2][n].forEach((item, index) => { if (item == '->') data.resultList[m][2][n][index] = '\u2192'; });
				data.resultList[m][2][n].forEach((item, index) => { if (item == '|-') data.resultList[m][2][n][index] = '\u22A2'; });
				data.resultList[m][2][n].forEach((item, index) => { if (item == 'CC') data.resultList[m][2][n][index] = '\u2102'; });
				var str = data.resultList[m][2][n].join(' ');
				str1 = str1.concat('\n', str);
			}
			str1 = str1.substring(1);
			proof.hypList.push(str1);
			proof.hypListList.push(str1.split('\n'));
		}
	}
	for (let m = 0; m < data.resultList.length; m++) {
		var str1 = "";
		let referencelistcloned = proof.referenceList.slice();
		for (let n = 0; n < Object.keys(data.subsDict[m]).length; n++) {
			data.subsDict[m][data.mandList[m][n][1]].forEach((item, index) => { if (item == '->') data.subsDict[m][data.mandList[m][n][1]][index] = '\u2192'; });
			var str = data.mandList[m][n][1] + " kintamasis keičiamas į " + data.subsDict[m][data.mandList[m][n][1]].join(' ');
			str1 = str1.concat('\n', str);
			var str = referencelistcloned[m].replaceAll(data.mandList[m][n][1], data.subsDict[m][data.mandList[m][n][1]].join(' '));
			referencelistcloned[m] = str;
		}
		str1 = str1.substring(1);
		proof.substList.push(str1);
		proof.expressionList.push(referencelistcloned[m]);
	}
	for (let m = 0; m < data.resultList.length; m++) {
		let hyplistcloned = proof.hypList.slice();
		if (proof.hypList[m] === "Hipotezių nėra.") {
			proof.hypExpressionList.push("------");
			proof.hypExpressionListList.push(["------"]);
		} else {
			for (let n = 0; n < Object.keys(data.subsDict[m]).length; n++) {
				var str = hyplistcloned[m].replaceAll(data.mandList[m][n][1], data.subsDict[m][data.mandList[m][n][1]].join(' '));
				hyplistcloned[m] = str;
			}
			proof.hypExpressionList.push(hyplistcloned[m]);
			proof.hypExpressionListList.push(hyplistcloned[m].split('\n'));
		}
	}
	let copiedArray = proof.expressionList.slice();
	for (let m = 0; m < data.resultList.length; m++) {
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
		proof.hypStepNumber.push(steps)
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
			document.getElementById('changetheorem').innerHTML = 'Keisti teoremą:  ' + first.label;
            console.log('Retrieved data:', data);
        } else {
            console.log('No data found with the specified index key');
        }
    };
    
    transaction.oncomplete = function(event) {
        console.log('Transaction completed');
    };
    
    transaction.onerror = function(event) {
        console.error('Transaction error:', event.target.error);
    };
};

request.onerror = function(event) {
    console.error('Database open error:', event.target.error);
};