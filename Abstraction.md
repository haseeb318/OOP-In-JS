# Abstraction in JavaScript — In Depth

## What Abstraction Actually Means

Abstraction means hiding complex implementation details and exposing only the essential features/interface needed to use something. It answers the question: "What does this do?" rather than "How does it do it?"

It's closely related to encapsulation but focuses on a different problem:

| Encapsulation | Abstraction |
| ------------- | ----------- |
| **Focus**: Protecting data by hiding it | **Focus**: Simplifying usage by hiding complexity |
| **Question it answers**: "Who can touch this state?" | **Question it answers**: "What do I need to know to use this?" |
| **Mechanism**: Private fields, closures | **Mechanism**: Simple interfaces, layers, hiding steps |

You use abstraction constantly without thinking about it — when you call `array.sort()`, you don't need to know if it uses quicksort, mergesort, or timsort internally. That's abstraction.

## A Simple Motivating Example

```javascript
// Without abstraction — caller has to know all the steps
const rawData = await fetch("https://api.example.com/users");
const json = await rawData.json();
const filtered = json.filter(u => u.active);
const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));
console.log(sorted);

// Every place in your code that needs users has to repeat all of this
```

```javascript
// With abstraction — complexity hidden behind one clear call
async function getActiveUsersSorted() {
  const res = await fetch("https://api.example.com/users");
  const json = await res.json();
  return json
    .filter(u => u.active)
    .sort((a, b) => a.name.localeCompare(b.name));
}

const users = await getActiveUsersSorted();
console.log(users);
```

The caller now just says "give me active users, sorted" — they don't need to know about fetch, JSON parsing, filtering, or sorting logic. That's the essence of abstraction: a simple interface hiding a complex process.

## Abstraction via Classes

Classes are a common vehicle for abstraction — the public methods form the "interface," while the internals stay hidden.

```javascript
class CoffeeMachine {
  #waterLevel = 100;
  #beansLevel = 100;

  #heatWater() {
    console.log("Heating water to 92°C...");
  }

  #grindBeans() {
    console.log("Grinding beans...");
  }

  #extractEspresso() {
    console.log("Extracting espresso under 9 bars of pressure...");
  }

  // The ONLY thing a user needs to know about
  makeCoffee() {
    if (this.#waterLevel < 10 || this.#beansLevel < 10) {
      console.log("Please refill machine");
      return;
    }
    this.#heatWater();
    this.#grindBeans();
    this.#extractEspresso();
    this.#waterLevel -= 10;
    this.#beansLevel -= 10;
    console.log("☕ Coffee ready!");
  }
}

const machine = new CoffeeMachine();
machine.makeCoffee();
// Heating water to 92°C...
// Grinding beans...
// Extracting espresso under 9 bars of pressure...
// ☕ Coffee ready!
```

The person using `CoffeeMachine` just calls `.makeCoffee()`. They never need to know about heating, grinding, or pressure extraction — those are implementation details, abstracted away behind one method.

**Note**: the private `#fields` here also give encapsulation — the two principles often work together, but abstraction is specifically about simplifying the interface, not just hiding data.

## Abstraction via Abstract-like Base Classes

JavaScript has no built-in `abstract` keyword (unlike Java/C#), but you can simulate abstract classes — classes meant only to be extended, never instantiated directly, defining what subclasses must do without specifying how.

```javascript
class Shape {
  constructor() {
    if (this.constructor === Shape) {
      throw new Error("Shape is abstract and cannot be instantiated directly");
    }
  }

  // "Abstract method" — declares the contract, no implementation
  getArea() {
    throw new Error("getArea() must be implemented by subclass");
  }

  // Concrete method built on top of the abstraction
  describe() {
    return `This shape has an area of ${this.getArea()}`;
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

const shapes = [new Circle(5), new Rectangle(4, 6)];

shapes.forEach(shape => {
  console.log(shape.describe());
});
// This shape has an area of 78.53981633974483
// This shape has an area of 24
```

```javascript
new Shape(); // ❌ Error: Shape is abstract and cannot be instantiated directly
```

What's abstracted here: `describe()` doesn't know or care how area is calculated for each shape — it just calls `getArea()` and trusts that whatever subclass is used has implemented it correctly. Each shape hides its own area-calculation formula behind the same simple method name.

## Abstraction via Modules (hiding "how" at the file level)

Abstraction also happens at the module level — exposing only what's needed and hiding internal helper functions.

```javascript
// mathUtils.js
function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function sieveOfEratosthenes(limit) {
  // complex internal algorithm...
}

// Only this is exposed — the rest stays internal to the module
export function getPrimesUpTo(limit) {
  const primes = [];
  for (let i = 2; i <= limit; i++) {
    if (isPrime(i)) primes.push(i);
  }
  return primes;
}
```

```javascript
// app.js
import { getPrimesUpTo } from "./mathUtils.js";

console.log(getPrimesUpTo(20)); // [2, 3, 5, 7, 11, 13, 17, 19]
// Caller has no idea isPrime() or sieveOfEratosthenes() even exist
```

Functions not explicitly exported are effectively invisible outside the module — a form of abstraction (and encapsulation) at the file/module level.

## Real-World Example: Abstracting a Fetch Layer

A very common practical use — hiding HTTP details behind a clean API-client interface:

```javascript
class ApiClient {
  #baseUrl;
  #headers;

  constructor(baseUrl, apiKey) {
    this.#baseUrl = baseUrl;
    this.#headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    };
  }

  async #request(path, options = {}) {
    const res = await fetch(`${this.#baseUrl}${path}`, {
      ...options,
      headers: { ...this.#headers, ...options.headers }
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
  }

  // Simple, task-focused public interface
  getUser(id) {
    return this.#request(`/users/${id}`);
  }

  createUser(data) {
    return this.#request("/users", {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
}

const api = new ApiClient("https://api.example.com", "secret-key-123");

const user = await api.getUser(42);
await api.createUser({ name: "Alice" });
```

Anyone using `ApiClient` just calls `.getUser(id)` or `.createUser(data)`. They never deal with headers, URL construction, error-status checking, or JSON parsing — all of that complexity is abstracted away behind two simple method calls.

## Why Abstraction Matters in Practice

| Benefit | Explanation |
| ------- | ----------- |
| **Simpler mental model** | Users of your code think in terms of "what it does," not "how it's built." |
| **Easier maintenance** | You can rewrite the internals (e.g., swap fetch for axios) without changing how callers use the class. |
| **Reduced cognitive load** | Nobody has to hold the entire system in their head — they interact with small, focused interfaces. |
| **Enables layering** | Complex systems are built by stacking simple abstractions on top of each other. |

## Abstraction + Encapsulation Together

In practice these two principles usually appear side by side:

```javascript
class Car {
  #engineRunning = false; // encapsulation: hidden internal state

  start() { // abstraction: simple interface hiding ignition sequence
    this.#checkFuel();
    this.#igniteEngine();
    this.#engineRunning = true;
    console.log("Car started");
  }

  #checkFuel() { /* internal complexity */ }
  #igniteEngine() { /* internal complexity */ }
}

const car = new Car();
car.start(); // "Car started" — driver doesn't need to know how ignition works
```

- **Encapsulation** = `#engineRunning`, `#checkFuel()`, `#igniteEngine()` are inaccessible from outside.
- **Abstraction** = `start()` is the only thing the driver needs to know about — the rest is simplified away, regardless of whether it's technically hidden or not.

---

*[Back to main README](README.md)