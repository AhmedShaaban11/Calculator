const screen = document.querySelector("#calculation-screen");
const errorScreen = document.querySelector("#error-screen");
const numbers = document.querySelectorAll(".number");
const operators = document.querySelectorAll(".operator");
const dot = document.querySelector("#dot");
const commands = document.querySelectorAll(".command");
const clearAll = document.querySelector("#clear-all");
const clearLast = document.querySelector("#clear-last");
const calculate = document.querySelector("#calculate");

const isOperator = (elem) => {
    for (operator of ['+', '-', '*', '/', '**']) {
        if (elem == operator) { return true; }
    }
    return false;
};

const precedence = (operator) => {
    if (operator == '+' || operator == '-') {
        return 1;
    } else if (operator == '*' || operator == '/') {
        return 2;
    } else if (operator == '**') {
        return 3;
    }
    return 0;
};

const strToInfix = (str) => {
    let token = "";
    let infix = [];
    for (val of str) {
        if (isFinite(val) || val === '.' || val === "e" || token[token.length - 1] === "e") {
            token += val;
        } else if (val === "-" && !token) { // Negative Numbers
            token += '-';
        } else {
            infix.push(token);
            (val === '^') ? infix.push('**') : infix.push(val);
            token = "";
        }
    }
    if (token) { infix.push(token); }
    return infix;
}

const infixToPostfix = (infix) => {
    let stack = [];
    let postfix = [];
    for (val of infix) {
        if (isFinite(val)) {
            postfix.push(val);
            continue;
        }
        if (val === "**") {
            if (precedence(val) >= precedence(stack[stack.length - 1])) {
                stack.push("**");
            } else {
                while (precedence(val) < precedence(stack[stack.length - 1])) {
                    postfix.push(stack.pop());
                }
                stack.push(val);
            }
        } else if (precedence(val) > precedence(stack[stack.length - 1])) {
            stack.push(val);
        } else {
            while (precedence(val) <= precedence(stack[stack.length - 1])) {
                postfix.push(stack.pop());
            }
            stack.push(val);
        }
    }
    while (stack.length !== 0) {
        postfix.push(stack.pop());
    }
    return postfix;
}

const calc = (a, b, operator) => {
    a = Number(a);
    b = Number(b);
    switch (operator) {
        case '+':
            return a + b;
        case '-':
            return a - b;
        case '*':
            return a * b;
        case '/':
            return a / b;
        case '**':
            return a ** b;
        default:
            return null;
    }
}

const calcPostfix = (postfix) => {
    let stack = [];
    for (val of postfix) {
        if (isFinite(val)) {
            stack.push(val);
            continue;
        }
        let b = stack.pop();
        let a = stack.pop();
        let res = calc(a, b, val);
        stack.push(res);
    }
    return stack[0];
}

let isDotValid = true;

dot.addEventListener("click", () => {
    if (isDotValid && screen.textContent.slice(-1) !== '.') {
        screen.textContent += '.';
        isDotValid = false;
    }
});

numbers.forEach((num) => {
    num.addEventListener("click", () => {
        errorScreen.textContent = "";
        screen.textContent += num.dataset.value;
    });
});

operators.forEach((operator) => {
    operator.addEventListener("click", () => {
        errorScreen.textContent = "";
        if (screen.textContent.slice(-1) === '.') { return; }
        const last = screen.textContent.slice(-1);
        const preLast = screen.textContent.slice(-2, -1);
        if (!isOperator(last) && last !== "" && last !== "e") {
            screen.textContent += operator.dataset.value;
            isDotValid = true;
        } else if (operator.dataset.value === "-" && (!last || (preLast && !isOperator(preLast) && preLast !== "e"))) { // Handling negative numbers
            screen.textContent += "-";
            isDotValid = true;
        }
    });
});

clearAll.addEventListener("click", () => {
    errorScreen.textContent = "";
    screen.textContent = "";
    isDotValid = true;
});

clearLast.addEventListener("click", () => {
    errorScreen.textContent = "";
    let last = screen.textContent.slice(-1);
    let preLast = screen.textContent.slice(-2, -1);
    screen.textContent = screen.textContent.slice(0, -1);
    if (last === ".") {
        isDotValid = true;
    } else if (isOperator(last)) {
        isDotValid = true;
        for (let i = screen.textContent.length; i >= 0; --i) {
            if (isOperator(screen.textContent[i]) && screen.textContent[i - 1] !== "e") { return; }
            if (screen.textContent[i] === '.' || screen.textContent[i] === 'e') {
                isDotValid = false;
                return;
            }
        }
    }
});

calculate.addEventListener("click", () => {
    if (!screen.textContent) {
        return;
    } else if (isNaN(screen.textContent.slice(-1))) {
        errorScreen.textContent = "Invalid Operation";
        return;
    }
    const infix = strToInfix(screen.textContent);
    const postfix = infixToPostfix(infix);
    const result = calcPostfix(postfix);
    if (!isFinite(result)) {
        errorScreen.textContent = "Infinity";
    } else {
        screen.textContent = result;
        isDotValid = Number.isInteger(result);
        for (let i = 0; i < screen.textContent.length; ++i) {
            if (screen.textContent[i] === 'e') {
                isDotValid = false;
                break;
            }
        }
    }
});
