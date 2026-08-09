# Encapsulation in JavaScript

## What Encapsulation Actually Means

Encapsulation has two related ideas bundled together:

1. **Bundling** grouping data (properties) and the methods that operate on that data into a single unit (an object or class).
2. **Information hiding** restricting direct access to some of that data, exposing only a controlled, well-defined interface (public methods) for interacting with it.

The goal isn't secrecy for its own sake it's about **protecting invariants** (rules that must always hold true) and **reducing coupling** between the internal implementation and the code that uses the object. If internals are hidden, you can change _how_ something works internally without breaking code that depends on it.

---

## The Core Problem It Solves

Without encapsulation, any code can reach in and mutate an object's state directly:

```javascript
const account = { balance: 1000 };

account.balance = -50000; // nothing stops this
account.balance = "banana"; // nothing stops this either
```

There's no way to enforce rules like "balance can never go negative" or "balance must be a number." Encapsulation fixes this by forcing all state changes to go through methods that can validate, transform, or reject the change.

---

## Techniques for Encapsulation in JavaScript

JavaScript has evolved several ways to achieve this, from weakest to strongest.

### 1. Convention-based "privacy" (underscore prefix) — weakest

```javascript
class Account {
  constructor(balance) {
    this._balance = balance; // underscore = "please don't touch"
  }

  deposit(amount) {
    this._balance += amount;
  }
}

const a = new Account(100);
a._balance = -999; // still totally accessible — this is just a convention
```

This provides **zero actual protection**. It's a signal to other developers, not an enforcement mechanism. Included here mainly because you'll see it in older/legacy code.

### 2. Closures — true privacy, pre-ES2022 standard approach

A closure lets an inner function "remember" variables from its enclosing scope, even after that outer function has returned. This can hide variables completely.

```javascript
function createCounter() {
  let count = 0; // trapped inside this closure — inaccessible from outside

  return {
    increment() {
      count++;
      return count;
    },

    decrement() {
      count--;
      return count;
    },

    getCount() {
      return count;
    },
  };
}

const counter = createCounter();

counter.increment();
counter.increment();

console.log(counter.getCount()); // 2
console.log(counter.count); // undefined — no access path exists at all
```

**Why this works:** `count` is a local variable inside `createCounter()`. The only references to it are the three inner functions, which are returned. There is literally no syntax that lets outside code reach `count` — it's not hidden by convention, it's hidden by scope.

### 3. Private class fields (`#field`) — modern standard (ES2022+)

```javascript
class Temperature {
  #celsius;

  constructor(celsius) {
    this.#celsius = celsius;
  }

  get fahrenheit() {
    return (this.#celsius * 9) / 5 + 32;
  }

  set fahrenheit(f) {
    this.#celsius = ((f - 32) * 5) / 9;
  }

  #validate(value) {
    // private methods too — # works on methods, not just fields
    if (typeof value !== "number") {
      throw new Error("Must be a number");
    }
  }
}

const t = new Temperature(25);

console.log(t.fahrenheit); // 77

t.fahrenheit = 98.6;

console.log(t.fahrenheit); // 98.6

t.#celsius; // ❌ SyntaxError at parse time — not even a runtime error, it's invisible to the language outside the class
```

Key details:

- The `#` is part of the field name syntax, enforced by the JS engine itself — not just convention.
- Private fields aren't inherited the way public ones are; subclasses can't directly touch a parent's `#fields`.
- Trying to access `#field` from outside the class is a **syntax error**, not just `undefined` — the engine refuses to even parse it as valid, which is stronger than closures in some tooling/reflection scenarios.

### 4. `WeakMap`-based privacy — an older workaround, still useful to know

This was a common pattern before `#fields` existed.

```javascript
const _balance = new WeakMap();

class Account {
  constructor(balance) {
    _balance.set(this, balance);
  }

  deposit(amount) {
    _balance.set(this, _balance.get(this) + amount);
  }

  getBalance() {
    return _balance.get(this);
  }
}
```

The `WeakMap` lives outside the class, keyed by instance (`this`), so external code has no reference to it. Rarely needed now that `#fields` exist, but you'll encounter it in older codebases/libraries.

---

## Getters and Setters — the "controlled interface" part

Encapsulation isn't just about hiding data — it's about exposing a **safe, deliberate interface** on top of it. Getters/setters let you keep the _syntax_ of simple property access while running logic underneath:

```javascript
class User {
  #email;

  constructor(email) {
    this.email = email; // goes through the setter below
  }

  get email() {
    return this.#email;
  }

  set email(value) {
    if (!value.includes("@")) {
      throw new Error("Invalid email address");
    }

    this.#email = value.toLowerCase().trim();
  }
}

const u = new User("  Alice@Example.com  ");

console.log(u.email); // "alice@example.com" — normalized automatically

u.email = "not-an-email"; // ❌ throws "Invalid email address"
```

From the outside, `u.email = "..."` _looks_ like plain property assignment — but it's secretly running validation and normalization. This is encapsulation's real power: **callers don't need to know or care about the internal rules; the object enforces them itself.**

---

## Why This Matters in Practice

| Benefit              | Explanation                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Data integrity**   | Invalid states (negative balances, malformed emails) become impossible to create.                                                                                              |
| **Reduced coupling** | External code depends only on the public method names/signatures, not internal structure.                                                                                      |
| **Safe refactoring** | You can completely rewrite `#balance` storage (e.g., switch to storing cents as an integer) without breaking any external code, as long as the public methods behave the same. |
| **Debuggability**    | Since state can only change through a small set of methods, bugs are easier to trace — you don't have to search the entire codebase for random property assignments.           |

---

## Full Example Putting It Together

```javascript
class ShoppingCart {
  #items = [];
  #discountRate = 0;

  addItem(name, price, quantity = 1) {
    if (price < 0) {
      throw new Error("Price cannot be negative");
    }

    this.#items.push({ name, price, quantity });
  }

  removeItem(name) {
    this.#items = this.#items.filter((item) => item.name !== name);
  }

  applyDiscount(rate) {
    if (rate < 0 || rate > 1) {
      throw new Error("Discount must be between 0 and 1");
    }

    this.#discountRate = rate;
  }

  get total() {
    const subtotal = this.#items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return subtotal * (1 - this.#discountRate);
  }

  get itemCount() {
    return this.#items.reduce((sum, item) => sum + item.quantity, 0);
  }
}

const cart = new ShoppingCart();

cart.addItem("Book", 20, 2);
cart.addItem("Pen", 3, 5);
cart.applyDiscount(0.1);

console.log(cart.total); // 51 → (40 + 15) * 0.9
console.log(cart.itemCount); // 7

cart.#items; // ❌ SyntaxError — can't touch internal array directly
cart.total = 999; // ❌ TypeError — `total` has no setter, it's read-only by design
```

Notice: `#items` can never be corrupted from outside (e.g., someone pushing a malformed item), and `total` can't be overwritten with a fake value — it's always _derived_ from real state. That's encapsulation doing its job: **the object protects itself.**
