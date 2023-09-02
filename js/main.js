const screen = document.querySelector("#calculation-screen");
const errorScreen = document.querySelector("#error-screen");
const numbers = document.querySelectorAll(".number");
const operators = document.querySelectorAll(".operator");
const commands = document.querySelectorAll(".command");
const clearAll = document.querySelector("#clear-all");
const clearLast = document.querySelector("#clear-last");
const calculate = document.querySelector("#calculate");
const btns = document.querySelectorAll(".btn");

const precedence = (operator) => {
    if (operator == '+' || operator == '-') {
        return 1;
    } else if (operator == '*' || operator == '/') {
        return 2;
    } else if (operator == '^') {
        return 3;
    }
    return 0;
};

const validateInput = (str) => {
    const validNumber = /^(\-|\+)?(\d+\.?\d*|\d*\.\d+)(e(\-|\+)?\d+)?$/;
    const validOperator = /^[-+*/^]$/;
    const arr = str.split(" ");
    if (arr.length % 2 != 1) { return false; } // # of operators + # of numbers = odd -- 2+3
    for (let i = 0; i < arr.length; i++) {
        if (i % 2 === 0) {
            if (!validNumber.test(arr[i])) { return false; }
        } else {
            if (!validOperator.test(arr[i])) { return false; }
        }
    }
    return true;
};

const strToInfix = (str) => {
    let arr = str.split(" ");
    return arr;
}

const infixToPostfix = (infix) => {
    let stack = [];
    let postfix = [];
    for (val of infix) {
        if (isFinite(val)) {
            postfix.push(val);
            continue;
        }
        if (val === "^") {
            if (precedence(val) >= precedence(stack[stack.length - 1])) {
                stack.push(val);
            } else {
                while (precedence(val) < precedence(stack[stack.length - 1])) {
                    postfix.push(stack.pop());
                }
                stack.push(val);
            }
        } else {
            if (precedence(val) > precedence(stack[stack.length - 1])) {
                stack.push(val);
            } else {
                while (precedence(val) <= precedence(stack[stack.length - 1])) {
                    postfix.push(stack.pop());
                }
                stack.push(val);
            }
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
        case '^':
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

btns.forEach((btn) => {
    btn.addEventListener("click", () => errorScreen.textContent = "");
});

numbers.forEach((num) => {
    num.addEventListener("click", () => {
        screen.value += num.dataset.value;
        errorScreen.textContent = "";
    });
});

operators.forEach((operator) => {
    operator.addEventListener("click", () => {
        const opVal = operator.dataset.value;
        const last = screen.value.slice(-1);
        // Sign Numbers
        if ((opVal === "-" || opVal === "+") && (!screen.value || /^[-+*/^] $/.test(screen.value.slice(-2)))) {
            screen.value += opVal;
            // e scientific notation
        } else if (last === "e" && (opVal === "-" || opVal === "+")) {
            screen.value += opVal;
        } else {
            screen.value += ` ${opVal} `;
        }
        errorScreen.textContent = "";
    });
});

clearAll.addEventListener("click", () => {
    screen.value = "";
    errorScreen.textContent = "";
});

clearLast.addEventListener("click", () => {
    let nDel = 1;
    if (screen.value.slice(-1) === " ") { nDel = 3 } // if last input is operator
    screen.value = screen.value.slice(0, -nDel);
    errorScreen.textContent = "";
});

calculate.addEventListener("click", () => {
    if (!screen.value) {
        return;
    } else if (!validateInput(screen.value)) {
        errorScreen.textContent = "Invalid Operation";
        return;
    }
    const infix = strToInfix(screen.value);
    const postfix = infixToPostfix(infix);
    const result = calcPostfix(postfix);
    if (!isFinite(result)) {
        errorScreen.textContent = Infinity;
        return;
    }
    screen.value = Number(result);
});
