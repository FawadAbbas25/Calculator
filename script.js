/* =================================
   DOM ELEMENTS
================================= */

const expressionDisplay =
    document.getElementById("expression");

const resultDisplay =
    document.getElementById("result");

const angleModeButton =
    document.getElementById("angleMode");


/* =================================
   CALCULATOR STATE
================================= */

let expression = "";

let answer = 0;

let angleMode = "DEG";

let justCalculated = false;


/* =================================
   OPERATORS
================================= */

const operators = [
    "+",
    "−",
    "×",
    "÷"
];


function isOperator(character) {
    return operators.includes(character);
}


/* =================================
   DISPLAY
================================= */

function updateDisplay() {

    expressionDisplay.textContent =
        expression || "Ready";

    resultDisplay.textContent =
        expression || "0";
}


/* =================================
   NUMBER INPUT
================================= */

function addValue(value) {

    /*
        If a result was already calculated
        and user enters a number,
        start a new calculation.
    */

    if (
        justCalculated &&
        !isOperator(value) &&
        value !== ")"
    ) {

        expression = "";

        justCalculated = false;
    }


    /* Prevent multiple decimal points */

    if (value === ".") {

        const parts =
            expression.split(/[+−×÷()]/);

        const currentNumber =
            parts[parts.length - 1];

        if (currentNumber.includes(".")) {
            return;
        }

        if (
            currentNumber === "" ||
            currentNumber === undefined
        ) {
            expression += "0";
        }
    }


    /* Prevent invalid operators */

    if (isOperator(value)) {

        if (expression === "") {
            return;
        }

        const lastCharacter =
            expression[expression.length - 1];

        if (isOperator(lastCharacter)) {

            expression =
                expression.slice(0, -1) + value;

            updateDisplay();

            return;
        }
    }


    expression += value;

    updateDisplay();
}


/* =================================
   TOKENIZER
================================= */

function tokenize(input) {

    const tokens = [];

    let index = 0;


    while (index < input.length) {

        const character =
            input[index];


        /* Ignore spaces */

        if (character === " ") {

            index++;

            continue;
        }


        /* Numbers */

        if (
            /[0-9.]/.test(character)
        ) {

            let end =
                index + 1;


            while (
                end < input.length &&
                /[0-9.]/.test(input[end])
            ) {

                end++;
            }


            const number =
                Number(
                    input.substring(
                        index,
                        end
                    )
                );


            if (Number.isNaN(number)) {

                throw new Error(
                    "Invalid number"
                );
            }


            tokens.push({
                type: "number",
                value: number
            });


            index = end;

            continue;
        }


        /* Pi */

        if (character === "π") {

            tokens.push({
                type: "number",
                value: Math.PI
            });

            index++;

            continue;
        }


        /* Euler number */

        if (character === "e") {

            tokens.push({
                type: "number",
                value: Math.E
            });

            index++;

            continue;
        }


        /* Operators */

        if (
            "+−×÷^".includes(character)
        ) {

            tokens.push({
                type: "operator",
                value: character
            });

            index++;

            continue;
        }


        /* Parentheses */

        if (
            character === "(" ||
            character === ")"
        ) {

            tokens.push({
                type: character,
                value: character
            });

            index++;

            continue;
        }


        throw new Error(
            "Invalid character"
        );
    }


    return tokens;
}


/* =================================
   EXPRESSION EVALUATOR
   NO eval()
================================= */

function evaluateExpression(input) {

    const tokens =
        tokenize(input);

    let position = 0;


    /* --------------------------------
       PRIMARY
    -------------------------------- */

    function primary() {

        const token =
            tokens[position];


        if (!token) {

            throw new Error(
                "Incomplete expression"
            );
        }


        /* Number */

        if (token.type === "number") {

            position++;

            return token.value;
        }


        /* Parentheses */

        if (token.type === "(") {

            position++;

            const value =
                addition();


            if (
                !tokens[position] ||
                tokens[position].type !== ")"
            ) {

                throw new Error(
                    "Missing )"
                );
            }


            position++;

            return value;
        }


        /* Positive / negative */

        if (
            token.type === "operator" &&
            (
                token.value === "+" ||
                token.value === "−"
            )
        ) {

            position++;

            const value =
                primary();


            if (
                token.value === "−"
            ) {

                return -value;
            }


            return value;
        }


        throw new Error(
            "Invalid expression"
        );
    }


    /* --------------------------------
       POWER
    -------------------------------- */

    function power() {

        let value =
            primary();


        if (
            tokens[position] &&
            tokens[position].type === "operator" &&
            tokens[position].value === "^"
        ) {

            position++;


            const exponent =
                power();


            value =
                Math.pow(
                    value,
                    exponent
                );
        }


        return value;
    }


    /* --------------------------------
       MULTIPLICATION / DIVISION
    -------------------------------- */

    function multiplication() {

        let value =
            power();


        while (
            tokens[position] &&
            tokens[position].type === "operator" &&
            (
                tokens[position].value === "×" ||
                tokens[position].value === "÷"
            )
        ) {

            const operator =
                tokens[position].value;

            position++;


            const nextValue =
                power();


            if (
                operator === "÷" &&
                nextValue === 0
            ) {

                throw new Error(
                    "Cannot divide by zero"
                );
            }


            if (operator === "×") {

                value *= nextValue;

            } else {

                value /= nextValue;
            }
        }


        return value;
    }


    /* --------------------------------
       ADDITION / SUBTRACTION
    -------------------------------- */

    function addition() {

        let value =
            multiplication();


        while (
            tokens[position] &&
            tokens[position].type === "operator" &&
            (
                tokens[position].value === "+" ||
                tokens[position].value === "−"
            )
        ) {

            const operator =
                tokens[position].value;

            position++;


            const nextValue =
                multiplication();


            if (operator === "+") {

                value += nextValue;

            } else {

                value -= nextValue;
            }
        }


        return value;
    }


    const finalResult =
        addition();


    if (
        position < tokens.length
    ) {

        throw new Error(
            "Invalid expression"
        );
    }


    if (
        !Number.isFinite(finalResult)
    ) {

        throw new Error(
            "Result is too large"
        );
    }


    return Number(
        finalResult.toPrecision(12)
    );
}


/* =================================
   FORMAT NUMBER
================================= */

function formatNumber(number) {

    return Number(
        number.toPrecision(12)
    ).toString();
}


/* =================================
   CURRENT VALUE
================================= */

function getCurrentValue() {

    try {

        return evaluateExpression(
            expression || "0"
        );

    } catch {

        return answer;
    }
}


/* =================================
   SCIENTIFIC UNARY FUNCTIONS
================================= */

function scientificFunction(
    name,
    calculation
) {

    try {

        const value =
            getCurrentValue();


        const calculated =
            calculation(value);


        if (
            !Number.isFinite(calculated)
        ) {

            throw new Error(
                "Invalid result"
            );
        }


        answer =
            calculated;


        expression =
            formatNumber(calculated);


        justCalculated = true;


        expressionDisplay.textContent =
            `${name}(${formatNumber(value)})`;


        resultDisplay.textContent =
            expression;


    } catch (error) {

        expressionDisplay.textContent =
            "Error";

        resultDisplay.textContent =
            error.message;


        justCalculated = true;
    }
}


/* =================================
   FACTORIAL
================================= */

function factorial(number) {

    if (
        number < 0 ||
        !Number.isInteger(number)
    ) {

        throw new Error(
            "Factorial requires a non-negative integer"
        );
    }


    if (number > 170) {

        throw new Error(
            "Number is too large"
        );
    }


    let result = 1;


    for (
        let i = 2;
        i <= number;
        i++
    ) {

        result *= i;
    }


    return result;
}


/* =================================
   BUTTON ACTIONS
================================= */

function handleAction(action) {


    /* CLEAR */

    if (action === "clear") {

        expression = "";

        answer = 0;

        justCalculated = false;

        updateDisplay();

        return;
    }


    /* DELETE */

    if (action === "delete") {

        if (justCalculated) {

            expression = "";

            justCalculated = false;

        } else {

            expression =
                expression.slice(0, -1);
        }


        updateDisplay();

        return;
    }


    /* EQUALS */

    if (
        action === "equals"
    ) {

        try {

            const value =
                evaluateExpression(
                    expression || "0"
                );


            answer = value;

            expression =
                formatNumber(value);


            justCalculated = true;


            expressionDisplay.textContent =
                "Result";


            resultDisplay.textContent =
                expression;


        } catch (error) {

            expressionDisplay.textContent =
                "Error";

            resultDisplay.textContent =
                error.message;


            justCalculated = true;
        }


        return;
    }


    /* SINE */

    if (action === "sin") {

        scientificFunction(
            "sin",
            value => {

                const radians =
                    angleMode === "DEG"
                        ? value * Math.PI / 180
                        : value;


                return Math.sin(
                    radians
                );
            }
        );

        return;
    }


    /* COSINE */

    if (action === "cos") {

        scientificFunction(
            "cos",
            value => {

                const radians =
                    angleMode === "DEG"
                        ? value * Math.PI / 180
                        : value;


                return Math.cos(
                    radians
                );
            }
        );

        return;
    }


    /* TANGENT */

    if (action === "tan") {

        scientificFunction(
            "tan",
            value => {

                const radians =
                    angleMode === "DEG"
                        ? value * Math.PI / 180
                        : value;


                return Math.tan(
                    radians
                );
            }
        );

        return;
    }


    /* LOG */

    if (action === "log") {

        scientificFunction(
            "log",
            value => {

                if (value <= 0) {

                    throw new Error(
                        "log domain error"
                    );
                }


                return Math.log10(
                    value
                );
            }
        );

        return;
    }


    /* NATURAL LOG */

    if (action === "ln") {

        scientificFunction(
            "ln",
            value => {

                if (value <= 0) {

                    throw new Error(
                        "ln domain error"
                    );
                }


                return Math.log(
                    value
                );
            }
        );

        return;
    }


    /* SQUARE ROOT */

    if (action === "sqrt") {

        scientificFunction(
            "√",
            value => {

                if (value < 0) {

                    throw new Error(
                        "Square root domain error"
                    );
                }


                return Math.sqrt(
                    value
                );
            }
        );

        return;
    }


    /* SQUARE */

    if (action === "square") {

        scientificFunction(
            "square",
            value => value * value
        );

        return;
    }


    /* FACTORIAL */

    if (action === "factorial") {

        scientificFunction(
            "factorial",
            factorial
        );

        return;
    }


    /* PERCENT */

    if (action === "percent") {

        scientificFunction(
            "%",
            value => value / 100
        );

        return;
    }


    /* NEGATIVE */

    if (action === "negate") {

        scientificFunction(
            "±",
            value => -value
        );

        return;
    }


    /* ANSWER */

    if (action === "ans") {

        addValue(
            formatNumber(answer)
        );

        return;
    }


    /* PI */

    if (action === "pi") {

        addValue("π");

        return;
    }


    /* EULER */

    if (action === "e") {

        addValue("e");

        return;
    }


    /* POWER */

    if (action === "power") {

        addValue("^");

        return;
    }
}


/* =================================
   NORMAL BUTTONS
================================= */

const valueButtons =
    document.querySelectorAll(
        "[data-value]"
    );


valueButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            addValue(
                button.dataset.value
            );
        }
    );
});


/* =================================
   ACTION BUTTONS
================================= */

const actionButtons =
    document.querySelectorAll(
        "[data-action]"
    );


actionButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            handleAction(
                button.dataset.action
            );
        }
    );
});


/* =================================
   DEG / RAD MODE
================================= */

angleModeButton.addEventListener(
    "click",
    () => {

        if (
            angleMode === "DEG"
        ) {

            angleMode = "RAD";

        } else {

            angleMode = "DEG";
        }


        angleModeButton.textContent =
            angleMode;
    }
);


/* =================================
   KEYBOARD SUPPORT
================================= */

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key;


        /* Numbers */

        if (
            /^[0-9.]$/.test(key)
        ) {

            addValue(key);

            return;
        }


        /* Operators */

        if (key === "+") {

            addValue("+");

            return;
        }


        if (key === "-") {

            addValue("−");

            return;
        }


        if (key === "*") {

            addValue("×");

            return;
        }


        if (key === "/") {

            addValue("÷");

            return;
        }


        /* Parentheses */

        if (
            key === "(" ||
            key === ")"
        ) {

            addValue(key);

            return;
        }


        /* Calculate */

        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            handleAction("equals");

            return;
        }


        /* Backspace */

        if (
            key === "Backspace"
        ) {

            event.preventDefault();

            handleAction("delete");

            return;
        }


        /* Escape */

        if (
            key === "Escape"
        ) {

            handleAction("clear");

            return;
        }
    }
);


/* =================================
   INITIAL DISPLAY
================================= */

updateDisplay();