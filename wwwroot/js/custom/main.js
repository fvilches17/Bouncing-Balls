///Requires jquery 3.3.*

let circlesOnScreen = new Map();
let isAnimationOn = true;

const ANIMATION_SPEED = {
    Glacial: 100,
    Slow   : 60,
    Medium : 25,
    Fast   : 1
};

const CIRCLE_MAX_RADIUS = 200;

const CIRCLE_COLORS = [
    "red",
    "green",
    "blue",
    "black",
    "purple",
    "darkblue",
    "gold",
    "indigo",
    "chocolate"
];

const KEY_CODES = {
    Enter: "13"
};

class Element {
    constructor({ html, deltaAxisX, deltaAxisY, speed = 0 }) {
        this.html       = html;
        this.deltaAxisX = deltaAxisX;
        this.deltaAxisY = deltaAxisY;
        this.speed      = speed;
        this.directionX = 1;
        this.directionY = 1;
    }

    get positionX() {
        return this.html.offset().left;
    }

    get positionY() {
        return this.html.offset().top;
    }

    get width() {
        return this.html.width();
    }

    get height() {
        return this.html.height();
    }
}

let moveElement = ({ element, container }) => {
    //Move on X Axis
    let positionX          = element.positionX;
    let leftBorderReached  = positionX < 0;
    let rightBorderReached = positionX > container.width() - element.width - 10;
    if (leftBorderReached || rightBorderReached) {
        element.directionX *= -1;
    }

    let newPositionX = element.directionX * element.deltaAxisX + positionX + "px";

    //Move on Y Axis
    let positionY           = element.positionY;
    let topBorderReached    = positionY < 0;
    let bottomBorderReached = positionY > container.height() - element.height - 5;
    if (topBorderReached || bottomBorderReached) {
        element.directionY *= -1;
    }

    let newPositionY = element.directionY * element.deltaAxisY + positionY + "px";

    //Apply Positioning Styles
    let newStyles = {
        left  : newPositionX,
        top   : newPositionY,
    };

    element.html.css(newStyles);
};

let generateRandomColor = () => {
    let numberOfColorsAvailable = CIRCLE_COLORS.length;
    let colorArrayIndex = generateRandomNumber({ ceiling: numberOfColorsAvailable }) - 1;

    return CIRCLE_COLORS[colorArrayIndex];
};

let generateRandomNumber = ({ ceiling }) => {
    return Math.floor(Math.random() * ceiling + 1);
};

let generateAxisDelta = () => {
    let delta = generateRandomNumber({ ceiling: 3 });
    let isPositiveNumber = generateRandomNumber({ ceiling: 10 }) >= 5;
    if (isPositiveNumber) return delta;
    return delta * -1;
};

let generatePositionForCircle = ({ axis, radius, container }) => {
    let initialPosition = 0;
    switch (axis.toLowerCase()) {
        case "x":
            initialPosition = generateRandomNumber({ ceiling: container.width() });
            let isCircleOnLeftSideOfScreen = initialPosition < container.width() / 2;
            return isCircleOnLeftSideOfScreen ? (initialPosition += radius) : (initialPosition -= radius);
        case "y":
            initialPosition = generateRandomNumber({ ceiling: container.height() });
            let isCircleOnTopSideOfScreen = initialPosition < container.height() / 2;
            return isCircleOnTopSideOfScreen ? (initialPosition += radius) : (initialPosition -= radius);
        default:
            console.error(`Incorrect axis passed as argument: ${axis}`);
            break;
    }
};

let startAnimation = () => {
    let numberOfCircles = parseInt($("#input-numberOfCircles").val());
    let selectedSpeed   = parseInt($("#select-animationSpeed").val());
    let animationArea   = $("#section-animationArea");
    let containerWidth  = animationArea.width();
    let containerHeight = animationArea.height();

    for (var i = 0; i < numberOfCircles; i++) {
        //Define Geometry Settings
        let radius           = generateRandomNumber({ ceiling: CIRCLE_MAX_RADIUS });
        let initialPositionX = generatePositionForCircle({ axis: "x", radius: radius, container: animationArea }) + "px";
        let initialPositionY = generatePositionForCircle({ axis: "y", radius: radius, container: animationArea }) + "px";

        //Define Circle Styles
        let styles = {
            width     : radius,
            height    : radius,
            left      : initialPositionX,
            top       : initialPositionY,
            background: `radial-gradient(circle at center, ${generateRandomColor()}, ${generateRandomColor()})`,
            opacity   : (10 - generateRandomNumber({ ceiling: 5 })) / 10,
            boxShadow : `0 0 30px ${generateRandomColor()}`
        };

        //Create Circle
        let newCircle = $("<span class='circle'></span>");

        //Apply Styles
        newCircle.css(styles);

        //Insert Circle into Animation Area
        animationArea.append(newCircle);

        //Start Animation
        let circle = new Element({
            html      : newCircle,
            deltaAxisX: generateAxisDelta(),
            deltaAxisY: generateAxisDelta(),
            speed     : selectedSpeed
        });

        circlesOnScreen.set(
            setInterval(moveElement, selectedSpeed, {
                element  : circle,
                container: animationArea
            }),
            circle
        );
    }
};

let toggleAnimation = (event) => {
    //Pause animation
    if (isAnimationOn) {
        circlesOnScreen.forEach((ball, intervalId) => {
            clearInterval(intervalId);
        });
    }
    //Resume animation (regenerate all time interval functions)
    else {
        //Create temp array of circles
        let circlesToReAnimate = new Array();
        circlesOnScreen.forEach((timeIntervalId) => {
            circlesToReAnimate.push(timeIntervalId);
        });

        //Reset circles on screen map
        circlesOnScreen = new Map();

        //Re-generate setInterval functions for each circle
        let container = $("#section-animationArea");
        circlesToReAnimate.forEach((circle) => {
            circlesOnScreen.set(
                setInterval(moveElement, circle.speed, {
                    element  : circle,
                    container: container
                }),
                circle
            );
        });
    }

    //Toggle settings buttons behaviour and appearance
    isAnimationOn = !isAnimationOn;
    let buttonText = isAnimationOn ? "Stop" : "Resume";
    let isStartButtonDisabled = !isAnimationOn;

    $("#button-start").prop("disabled", isStartButtonDisabled);
    $(event.currentTarget).text(buttonText);
};

let loadAnimationSpeedOptions = () => {
    let selectElement = $("#select-animationSpeed");
    for (const nameOfSpeed in ANIMATION_SPEED) {
        if (ANIMATION_SPEED.hasOwnProperty(nameOfSpeed)) {
            const milliseconds = ANIMATION_SPEED[nameOfSpeed];
            selectElement.append($(`<option value=${milliseconds}>${nameOfSpeed}</option>`));
        }
    }
};

$(document).ready(() => {

    $("#input-numberOfCircles").keypress((e) => {
        let keycode = (e.keyCode ? e.keyCode : e.which);
        if (keycode == KEY_CODES.Enter) {
            $("#button-start").trigger("click");
        }
    });

    loadAnimationSpeedOptions();

    $("#button-start").click(startAnimation);
    $("#button-animate").click(toggleAnimation);
});

//TODO: style the settings section
//TODO: use webjobs instead
//TODO: create glow effect by playing with gradient and time interval
//TODO: fix bug, when ball appears on edge, it doesn't bounce properly
//TODO: general refactoring, make more object oriented