const canvas = $("#draw")[0];
const context = canvas.getContext("2d");
let state = [];

let color = $("#colorPicker").val();
let lineWidth;

$.ajax({
    type: "GET",
    url: window.location.pathname + "/getImage",

    success: data => {
        if (data) {
            let image = new Image();
            image.onload = () => {
                createImageBitmap(image, 0, 0, 800, 800).then(img => {
                    context.drawImage(img, 0, 0);
                    state = [() =>  context.drawImage(img, 0, 0)];
                });
                $(".load-screen").hide();
            };

            image.src = "data:image/png;base64," + data;
        }
        else{
            $(".load-screen").hide();
        }
    }
});

$("#colorPicker").change(() => {
    color = $("#colorPicker").val();
});
$("#size").change(() => {
    lineWidth = $("#size").val();
    $("#command-size-content").html(`Kích cỡ: ${lineWidth}`);
});

function draw(state) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    state.forEach(value => {
        value();
    });
}

$.ajaxSetup({
    headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
    }
});
$("#save").click(() => {
    $("#save").prop("disabled", true);
    state.unshift(() => {
        context.save();
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
    });
    draw(state);
    state.shift();
    canvas.toBlob(blob => {
        let data = new FormData();
        data.append("photo", blob);

        $.post({
            url: window.location.pathname,
            data: data,
            contentType: false,
            processData: false,
            success: data => {
                $("#save").prop("disabled", false);
            }
        });
    });
});

//Object draw
function DrawLine(context, color, lineWidth, startX, startY, endX, endY) {
    let path = new Path2D();
    path.moveTo(startX, startY);
    path.lineTo(endX, endY);
    return function() {
        context.save();
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke(path);
        context.restore();
    };
}
function DrawRectangle(context, color, lineWidth, startX, startY, endX, endY) {
    let path = new Path2D();
    let width = endX - startX;
    let height = endY - startY;
    path.rect(startX, startY, width, height);
    return function() {
        context.save();
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke(path);
        context.restore();
    };
}
function DrawCircle(context, color, lineWidth, startX, startY, endX, endY) {
    let radiusX, radiusY, centerX, centerY;
    if (startX > endX) {
        radiusX = (startX - endX) / 2;
        centerX = endX + radiusX;
    } else {
        radiusX = (endX - startX) / 2;
        centerX = startX + radiusX;
    }

    if (startY > endY) {
        radiusY = (startY - endY) / 2;
        centerY = endY + radiusY;
    } else {
        radiusY = (endY - startY) / 2;
        centerY = startY + radiusY;
    }

    const rotation = 0;
    const startAngle = 0;
    const endAngle = Math.PI * 2;
    let path = new Path2D();

    path.ellipse(
        centerX,
        centerY,
        radiusX,
        radiusY,
        rotation,
        startAngle,
        endAngle
    );
    return function() {
        context.save();
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke(path);
        context.restore();
    };
}

const drawLineButton = state => {
    let isPress = false;
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    canvas.onmousedown = e => {
        isPress = true;
        startX = e.clientX - canvas.getBoundingClientRect().left;
        startY = e.clientY - canvas.getBoundingClientRect().top;
    };

    canvas.onmousemove = e => {
        if (isPress) {
            let localState = state.slice();
            endX = e.clientX - canvas.getBoundingClientRect().left;
            endY = e.clientY - canvas.getBoundingClientRect().top;
            localState.push(
                new DrawLine(
                    context,
                    color,
                    lineWidth,
                    startX,
                    startY,
                    endX,
                    endY
                )
            );
            draw(localState);
        }
    };

    canvas.onmouseup = e => {
        if (isPress) {
            isPress = false;
            state.push(
                new DrawLine(
                    context,
                    color,
                    lineWidth,
                    startX,
                    startY,
                    endX,
                    endY
                )
            );
            draw(state);
        }
    };
    canvas.onmouseout = e => {
        if (isPress) {
            isPress = false;
            state.push(
                new DrawLine(
                    context,
                    color,
                    lineWidth,
                    startX,
                    startY,
                    endX,
                    endY
                )
            );
            draw(state);
        }
    };
};

const drawPencilButton = state => {
    let isPress = false;
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    let pencil = [];
    let localState;
    canvas.onmousedown = e => {
        isPress = true;
        localState = state.slice();
        pencil = [];
        startX = e.clientX - canvas.getBoundingClientRect().left;
        startY = e.clientY - canvas.getBoundingClientRect().top;
    };

    canvas.addEventListener("mousemove", e => {
        if (isPress) {
            endX = e.clientX - canvas.getBoundingClientRect().left;
            endY = e.clientY - canvas.getBoundingClientRect().top;
            pencil.push(
                new DrawLine(
                    context,
                    color,
                    lineWidth,
                    startX,
                    startY,
                    endX,
                    endY
                )
            );
            localState.push(
                new DrawLine(
                    context,
                    color,
                    lineWidth,
                    startX,
                    startY,
                    endX,
                    endY
                )
            );
            draw(localState);
            startX = e.clientX - canvas.getBoundingClientRect().left;
            startY = e.clientY - canvas.getBoundingClientRect().top;
        }
    });

    canvas.addEventListener("mouseup", e => {
        if (isPress) {
            isPress = false;
            const data = pencil;
            state.push(() => data.forEach(value => value()));
        }
    });

    canvas.addEventListener("mouseover", e => {
        if (isPress) {
            isPress = false;
            const data = pencil;
            state.push(() => data.forEach(value => value()));
        }
    });
};

const drawRectangleButton = state => {
    let isPress = false;
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    canvas.onmousedown = e => {
        isPress = true;
        startX = e.clientX - canvas.getBoundingClientRect().left;
        startY = e.clientY - canvas.getBoundingClientRect().top;
    };

    canvas.onmousemove = e => {
        if (isPress) {
            let localState = state.slice();
            endX = e.clientX - canvas.getBoundingClientRect().left;
            endY = e.clientY - canvas.getBoundingClientRect().top;
            localState.push(
                new DrawRectangle(
                    context,
                    color,
                    lineWidth,
                    startX,
                    startY,
                    endX,
                    endY
                )
            );
            draw(localState);
        }
    };

    canvas.onmouseup = e => {
        if (isPress) {
            isPress = false;
            state.push(
                new DrawRectangle(
                    context,
                    color,
                    lineWidth,
                    startX,
                    startY,
                    endX,
                    endY
                )
            );
            draw(state);
        }
    };

    canvas.onmouseout = e => {
        if (isPress) {
            isPress = false;
            state.push(
                new DrawRectangle(
                    context,
                    color,
                    lineWidth,
                    startX,
                    startY,
                    endX,
                    endY
                )
            );
            draw(state);
        }
    };
};

const drawCircleButton = state => {
    let isPress = false;
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    canvas.onmousedown = e => {
        isPress = true;
        startX = e.clientX - canvas.getBoundingClientRect().left;
        startY = e.clientY - canvas.getBoundingClientRect().top;
    };

    canvas.onmousemove = e => {
        if (isPress) {
            let localState = state.slice();
            endX = e.clientX - canvas.getBoundingClientRect().left;
            endY = e.clientY - canvas.getBoundingClientRect().top;
            localState.push(
                new DrawCircle(
                    context,
                    color,
                    lineWidth,
                    startX,
                    startY,
                    endX,
                    endY
                )
            );
            draw(localState);
        }
    };

    canvas.onmouseup = e => {
        if (isPress) {
            isPress = false;
            state.push(
                new DrawCircle(
                    context,
                    color,
                    lineWidth,
                    startX,
                    startY,
                    endX,
                    endY
                )
            );
            draw(state);
        }
    };

    canvas.onmouseout = e => {
        if (isPress) {
            isPress = false;
            state.push(
                new DrawCircle(
                    context,
                    color,
                    lineWidth,
                    startX,
                    startY,
                    endX,
                    endY
                )
            );
            draw(state);
        }
    };
};

function clearEventListener() {
    canvas.onmousedown = null;
    canvas.onmousemove = null;
    canvas.onmouseup = null;
    canvas.onmouseover = null;
    canvas.onclick = null;
}

window.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key == "z") {
        state.pop();
        draw(state);
    }
});

(function() {
    let buttonsList = [];
    buttonsList["pencil"] = $("#pencil")[0];
    buttonsList["line"] = $("#line")[0];
    buttonsList["rectangle"] = $("#rectangle")[0];
    buttonsList["circle"] = $("#circle")[0];
    buttonsList["fill"] = $("#fill")[0];
    const defautBackground = "#fdfdfe";
    const highlightBackground = "#ffdf7e";

    function setBackgroundButton(buttonClick) {
        for (let index in buttonsList) {
            buttonsList[index].style.background = defautBackground;
        }
        buttonClick.style.background = highlightBackground;
    }
    buttonsList["pencil"].onclick = e => {
        clearEventListener();
        drawPencilButton(state);
        setBackgroundButton(buttonsList["pencil"]);
    };
    buttonsList["line"].onclick = e => {
        clearEventListener();
        drawLineButton(state);
        setBackgroundButton(buttonsList["line"]);
    };
    buttonsList["rectangle"].onclick = e => {
        clearEventListener();
        drawRectangleButton(state);
        setBackgroundButton(buttonsList["rectangle"]);
    };
    buttonsList["circle"].onclick = e => {
        clearEventListener();
        drawCircleButton(state);
        setBackgroundButton(buttonsList["circle"]);
    };
    buttonsList["fill"].onclick = e => {
        clearEventListener();
        canvas.onclick = event => {
            const imageData = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

            const rect = canvas.getBoundingClientRect();
            const x = Math.round(event.clientX - rect.left);
            const y = Math.round(event.clientY - rect.top);
            floodFill(imageData, hexToRGBObject(color), x, y);
            state.push(function() {
                context.putImageData(imageData, 0, 0);
            });
            draw(state);
        };
        setBackgroundButton(buttonsList["fill"]);
    };
})();

function getColorAtPixel(imageData, x, y) {
    const { width, data } = imageData;

    return {
        r: data[4 * (width * y + x) + 0],
        g: data[4 * (width * y + x) + 1],
        b: data[4 * (width * y + x) + 2],
        a: data[4 * (width * y + x) + 3]
    };
}

function setColorAtPixel(imageData, color, x, y) {
    const { width, data } = imageData;

    data[4 * (width * y + x) + 0] = color.r & 0xff;
    data[4 * (width * y + x) + 1] = color.g & 0xff;
    data[4 * (width * y + x) + 2] = color.b & 0xff;
    data[4 * (width * y + x) + 3] = color.a & 0xff;
}

function colorMatch(a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

function floodFill(imageData, newColor, x, y) {
    const { width, height, data } = imageData;
    const stack = [];
    const baseColor = getColorAtPixel(imageData, x, y);
    let operator = { x, y };

    // Check if base color and new color are the same
    if (colorMatch(baseColor, newColor)) {
        return;
    }

    // Add the clicked location to stack
    stack.push({ x: operator.x, y: operator.y });

    while (stack.length) {
        operator = stack.pop();
        let contiguousDown = true; // Vertical is assumed to be true
        let contiguousUp = true; // Vertical is assumed to be true
        let contiguousLeft = false;
        let contiguousRight = false;

        // Move to top most contiguousDown pixel
        while (contiguousUp && operator.y >= 0) {
            operator.y--;
            contiguousUp = colorMatch(
                getColorAtPixel(imageData, operator.x, operator.y),
                baseColor
            );
        }

        // Move downward
        while (contiguousDown && operator.y < height) {
            setColorAtPixel(imageData, newColor, operator.x, operator.y);

            // Check left
            if (
                operator.x - 1 >= 0 &&
                colorMatch(
                    getColorAtPixel(imageData, operator.x - 1, operator.y),
                    baseColor
                )
            ) {
                if (!contiguousLeft) {
                    contiguousLeft = true;
                    stack.push({ x: operator.x - 1, y: operator.y });
                }
            } else {
                contiguousLeft = false;
            }

            // Check right
            if (
                operator.x + 1 < width &&
                colorMatch(
                    getColorAtPixel(imageData, operator.x + 1, operator.y),
                    baseColor
                )
            ) {
                if (!contiguousRight) {
                    stack.push({ x: operator.x + 1, y: operator.y });
                    contiguousRight = true;
                }
            } else {
                contiguousRight = false;
            }

            operator.y++;
            contiguousDown = colorMatch(
                getColorAtPixel(imageData, operator.x, operator.y),
                baseColor
            );
        }
    }
}

function hexToRGBObject(h) {
    let r = 0,
        g = 0,
        b = 0;
    console.log(h);
    // 3 digits
    if (h.length == 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];

        // 6 digits
    } else if (h.length == 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
    }

    return new Object({
        r: parseInt(r),
        g: parseInt(g),
        b: parseInt(b),
        a: 0xff
    });
}
