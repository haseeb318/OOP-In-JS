# Polymorphism in JavaScript — In Depth

## What Polymorphism Actually Means

Polymorphism comes from Greek: _poly_ (many) + _morph_ (forms). In programming, it means **the same interface or method name can behave differently depending on the object it is called on**. It answers the question: _"Can I treat different things uniformly while each does its own thing?"_

It completes the set of core OOP principles:

|          | Encapsulation         | Abstraction               | Inheritance               | Polymorphism                             |
| -------- | --------------------- | ------------------------- | ------------------------- | ---------------------------------------- |
| Focus    | Hiding data           | Simplifying interface     | Reusing behavior          | One interface, many behaviors            |
| Question | "Who can touch this?" | "What do I need to know?" | "What do I get for free?" | "Can I treat different types uniformly?" |

---

## The Core Idea

```javascript
class Animal {
  speak() {
    console.log("Some generic sound");
  }
}

class Dog extends Animal {
  speak() {
    console.log("Woof!");
  }
}

class Cat extends Animal {
  speak() {
    console.log("Meow!");
  }
}

class Cow extends Animal {
  speak() {
    console.log("Moo!");
  }
}

const animals = [new Dog(), new Cat(), new Cow()];

animals.forEach((animal) => animal.speak());
// Woof!
// Meow!
// Moo!
```

The loop calls `.speak()` on every item without checking what type each one is. Each object responds in its own way. The caller doesn't need `if (animal instanceof Dog)` branches. That's polymorphism: **one call, many behaviors, chosen at runtime.**

---

## Types of Polymorphism in JavaScript

### 1. Method Overriding (Runtime Polymorphism)

A subclass provides its own implementation of a method defined in the parent. Which version runs is decided **at runtime**, based on the actual object.

```javascript
class Shape {
  getArea() {
    return 0;
  }

  describe() {
    return `${this.constructor.name} with area ${this.getArea().toFixed(2)}`;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }
  getArea() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  getArea() {
    return this.width * this.height;
  }
}

class Triangle extends Shape {
  constructor(base, height) {
    super();
    this.base = base;
    this.height = height;
  }
  getArea() {
    return 0.5 * this.base * this.height;
  }
}

const shapes = [new Circle(3), new Rectangle(4, 5), new Triangle(6, 2)];

shapes.forEach((s) => console.log(s.describe()));
// Circle with area 28.27
// Rectangle with area 20.00
// Triangle with area 6.00
```

`describe()` is written **once** in `Shape`, yet it produces correct output for every subclass because `this.getArea()` resolves to the right version at runtime. Adding a new `Pentagon` class requires **zero changes** to `describe()` or to the loop.

### 2. Duck Typing (JavaScript's Natural Polymorphism)

JavaScript doesn't require a shared parent class. If an object has the method you need, it works. The saying goes: _"If it walks like a duck and quacks like a duck, it's a duck."_

```javascript
class Duck {
  speak() {
    console.log("Quack!");
  }
}

class Robot {
  speak() {
    console.log("Beep boop.");
  }
}

const person = {
  speak() {
    console.log("Hello!");
  },
};

function makeItSpeak(thing) {
  thing.speak(); // doesn't care what `thing` is, only that it has speak()
}

makeItSpeak(new Duck()); // Quack!
makeItSpeak(new Robot()); // Beep boop.
makeItSpeak(person); // Hello!
```

None of these share a parent class, and `person` is a plain object literal. Polymorphism still works because they share the same **interface** (a `speak` method). This is more flexible than class-based polymorphism in strictly typed languages like Java.

### 3. Method Overloading (Simulated)

Some languages let you define multiple methods with the same name but different parameters. **JavaScript does not support this natively**: defining a second method with the same name simply replaces the first.

```javascript
class Calculator {
  add(a, b) {
    return a + b;
  }
  add(a, b, c) {
    return a + b + c;
  } // overwrites the previous add()
}

const calc = new Calculator();
console.log(calc.add(1, 2)); // NaN — only the 3-parameter version exists
```

You can simulate overloading by checking arguments inside a single method:

```javascript
class Calculator {
  add(...args) {
    if (args.length === 0) return 0;

    if (args.every((a) => typeof a === "number")) {
      return args.reduce((sum, n) => sum + n, 0);
    }

    if (args.every((a) => typeof a === "string")) {
      return args.join(" ");
    }

    throw new Error("Unsupported argument types");
  }
}

const calc = new Calculator();
console.log(calc.add(1, 2)); // 3
console.log(calc.add(1, 2, 3, 4)); // 10
console.log(calc.add("Hello", "World")); // "Hello World"
```

One method name handles several kinds of input, which is a form of **ad-hoc polymorphism**.

### 4. Parametric / Generic-Style Polymorphism

Because JavaScript is dynamically typed, a function can naturally operate on values of any type, as long as the operations used are valid for them.

```javascript
function first(collection) {
  return collection[0];
}

console.log(first([10, 20, 30])); // 10
console.log(first("hello")); // "h"
console.log(first(["a", "b"])); // "a"
```

The same function works for arrays and strings alike, because both support index access.

---

## Polymorphism with `super`: Extending Instead of Replacing

An overridden method can still reuse the parent's logic:

```javascript
class Notification {
  constructor(message) {
    this.message = message;
  }

  send() {
    console.log(`Sending: ${this.message}`);
  }
}

class EmailNotification extends Notification {
  constructor(message, email) {
    super(message);
    this.email = email;
  }
  send() {
    super.send();
    console.log(`  → via email to ${this.email}`);
  }
}

class SMSNotification extends Notification {
  constructor(message, phone) {
    super(message);
    this.phone = phone;
  }
  send() {
    super.send();
    console.log(`  → via SMS to ${this.phone}`);
  }
}

const notifications = [
  new EmailNotification("Welcome!", "a@example.com"),
  new SMSNotification("Your code is 4821", "+92-300-1234567"),
];

notifications.forEach((n) => n.send());
// Sending: Welcome!
//   → via email to a@example.com
// Sending: Your code is 4821
//   → via SMS to +92-300-1234567
```

---

## Built-in Polymorphism You Already Use

JavaScript's own built-ins are polymorphic everywhere.

### `toString()`

```javascript
console.log([1, 2, 3].toString()); // "1,2,3"
console.log({}.toString()); // "[object Object]"
console.log((255).toString(16)); // "ff"
console.log(new Date(0).toString()); // a date string
```

Each type implements `toString()` differently.

### The `+` operator

```javascript
console.log(1 + 2); // 3 (numeric addition)
console.log("1" + "2"); // "12" (string concatenation)
console.log([1] + [2]); // "12" (coerced to strings)
```

### Overriding `toString()` in your own class

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}

const p = new Point(3, 4);
console.log(`Point is ${p}`); // "Point is (3, 4)" — template literal calls toString()
```

### `Symbol.iterator` (making objects work with `for...of`)

```javascript
class Countdown {
  constructor(start) {
    this.start = start;
  }

  [Symbol.iterator]() {
    let current = this.start;
    return {
      next: () =>
        current >= 0 ? { value: current--, done: false } : { done: true },
    };
  }
}

for (const n of new Countdown(3)) {
  console.log(n); // 3, 2, 1, 0
}

console.log([...new Countdown(3)]); // [3, 2, 1, 0]
```

By implementing `Symbol.iterator`, your class becomes usable anywhere JavaScript expects an iterable (`for...of`, spread, `Array.from`, destructuring). That is polymorphism through a shared protocol.

---

## Real-World Example: Payment Processing

```javascript
class PaymentMethod {
  pay(amount) {
    throw new Error("pay() must be implemented by subclass");
  }
}

class CreditCard extends PaymentMethod {
  constructor(cardNumber) {
    super();
    this.cardNumber = cardNumber;
  }
  pay(amount) {
    console.log(
      `Charged $${amount} to card ending in ${this.cardNumber.slice(-4)}`,
    );
  }
}

class PayPal extends PaymentMethod {
  constructor(email) {
    super();
    this.email = email;
  }
  pay(amount) {
    console.log(`Paid $${amount} via PayPal account ${this.email}`);
  }
}

class BankTransfer extends PaymentMethod {
  constructor(iban) {
    super();
    this.iban = iban;
  }
  pay(amount) {
    console.log(`Transferred $${amount} from IBAN ${this.iban}`);
  }
}

// This function doesn't know or care which payment type it receives
function checkout(cartTotal, paymentMethod) {
  console.log("Processing checkout...");
  paymentMethod.pay(cartTotal);
  console.log("Done!\n");
}

checkout(99.99, new CreditCard("4111111111111234"));
checkout(49.5, new PayPal("user@example.com"));
checkout(250, new BankTransfer("PK36SCBL0000001123456702"));
```

Output:

```
Processing checkout...
Charged $99.99 to card ending in 1234
Done!

Processing checkout...
Paid $49.5 via PayPal account user@example.com
Done!

Processing checkout...
Transferred $250 from IBAN PK36SCBL0000001123456702
Done!
```

`checkout()` is written once. Next month, if you add `ApplePay` or `Crypto`, you create a new class with a `pay()` method and **nothing else changes**. This is the Open/Closed Principle: code is _open for extension, closed for modification_.

---

## Polymorphism vs. a Giant `if/else` (Why It's Better)

Without polymorphism:

```javascript
function checkout(amount, method) {
  if (method.type === "card") {
    // card logic
  } else if (method.type === "paypal") {
    // paypal logic
  } else if (method.type === "bank") {
    // bank logic
  }
  // every new payment type means editing this function
}
```

With polymorphism:

```javascript
function checkout(amount, method) {
  method.pay(amount); // each object knows how to pay itself
}
```

The branching logic disappears, because each type carries its own behavior with it.

---

## Common Pitfalls

**1. Forgetting `super()` in constructors**

```javascript
class Child extends Parent {
  constructor() {
    this.x = 1; // ❌ ReferenceError — must call super() first
    super();
  }
}
```

**2. Relying on duck typing without checking**

```javascript
function makeItSpeak(thing) {
  thing.speak(); // 💥 TypeError if thing has no speak()
}
```

A defensive version:

```javascript
function makeItSpeak(thing) {
  if (typeof thing?.speak !== "function") {
    throw new TypeError("Object must implement speak()");
  }
  thing.speak();
}
```

**3. Inconsistent overrides**

If one subclass's `pay()` returns a string and another's returns a Promise, callers can't rely on a uniform contract. Overrides should honor the **same expectations** as the parent method (this is the Liskov Substitution Principle).

---

## Why Polymorphism Matters in Practice

| Benefit                     | Explanation                                                        |
| --------------------------- | ------------------------------------------------------------------ |
| **Eliminates conditionals** | No more long `if/else` or `switch` chains based on type.           |
| **Extensibility**           | Add new types without modifying existing code.                     |
| **Cleaner code**            | Callers work against a simple interface, not many concrete types.  |
| **Easier testing**          | You can pass in mock objects that implement the same method names. |
| **Reusability**             | One function or algorithm works with any compatible object.        |

---

## All Four Pillars Together

```javascript
class Employee {
  #salary; // ENCAPSULATION: hidden state

  constructor(name, salary) {
    this.name = name;
    this.#salary = salary;
  }

  getSalary() {
    return this.#salary;
  }

  // ABSTRACTION: callers just ask for pay, no need to know the formula
  calculatePay() {
    return this.#salary / 12;
  }
}

// INHERITANCE: reuse everything from Employee
class Manager extends Employee {
  constructor(name, salary, bonus) {
    super(name, salary);
    this.bonus = bonus;
  }
  // POLYMORPHISM: same method name, different behavior
  calculatePay() {
    return super.calculatePay() + this.bonus / 12;
  }
}

class Intern extends Employee {
  calculatePay() {
    return super.calculatePay() * 0.5;
  }
}

const staff = [
  new Employee("Ali", 60000),
  new Manager("Sara", 90000, 12000),
  new Intern("Omar", 24000),
];

staff.forEach((e) => {
  console.log(`${e.name}: $${e.calculatePay().toFixed(2)}/month`);
});
// Ali: $5000.00/month
// Sara: $8500.00/month
// Omar: $1000.00/month
```

- **Encapsulation**: `#salary` can't be modified from outside.
- **Abstraction**: callers just call `calculatePay()`.
- **Inheritance**: `Manager` and `Intern` extend `Employee`.
- **Polymorphism**: the loop calls the same method on every object, and each computes pay its own way.

---

## Quick Summary

- **Polymorphism** = one interface, many implementations.
- In JavaScript it appears through **method overriding**, **duck typing**, **simulated overloading**, and **shared protocols** like `toString` and `Symbol.iterator`.
- It replaces type-checking conditionals with objects that know how to behave.
- It works best when all implementations honor the same contract.
