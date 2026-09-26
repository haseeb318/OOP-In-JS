# Inheritance in JavaScript — In Depth

## What Inheritance Actually Means

Inheritance lets one class (the **child**/**subclass**) acquire the properties and methods of another class (the **parent**/**superclass**), so you don't have to rewrite shared logic. It answers the question: _"What is this thing a more specific version of?"_

It's the third pillar alongside encapsulation and abstraction:

|           | Encapsulation         | Abstraction               | Inheritance                       |
| --------- | --------------------- | ------------------------- | --------------------------------- |
| Focus     | Hiding data           | Simplifying interface     | Reusing & extending behavior      |
| Question  | "Who can touch this?" | "What do I need to know?" | "What do I already get for free?" |
| Mechanism | `#fields`, closures   | Simple method interfaces  | `extends`, `super`                |

---

## Basic Syntax: `extends` and `super`

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }

  eat() {
    console.log(`${this.name} is eating.`);
  }

  makeSound() {
    console.log(`${this.name} makes a sound.`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // calls Animal's constructor — MUST be called before using `this`
    this.breed = breed;
  }

  // Override — replaces the parent's version
  makeSound() {
    console.log(`${this.name} barks!`);
  }
}

const rex = new Dog("Rex", "Labrador");
rex.eat(); // Rex is eating.       (inherited from Animal, unchanged)
rex.makeSound(); // Rex barks!            (overridden in Dog)
console.log(rex.breed); // Labrador
```

**Key rules:**

- `extends` sets up the prototype chain so `Dog` instances can access `Animal`'s methods.
- `super(...)` calls the parent constructor and must run before you touch `this` in the child constructor.
- Defining a method with the same name in the child **overrides** the parent's version.
- You can still call the parent's version explicitly with `super.methodName()`.

---

## Calling the Parent's Method with `super`

Sometimes you don't want to fully replace a method — you want to extend it.

```javascript
class Employee {
  constructor(name, salary) {
    this.name = name;
    this.salary = salary;
  }

  getDetails() {
    return `${this.name} earns $${this.salary}`;
  }
}

class Manager extends Employee {
  constructor(name, salary, teamSize) {
    super(name, salary);
    this.teamSize = teamSize;
  }

  getDetails() {
    const base = super.getDetails(); // run the parent's version first
    return `${base} and manages a team of ${this.teamSize}`;
  }
}

const mgr = new Manager("Sara", 90000, 5);
console.log(mgr.getDetails());
// "Sara earns $90000 and manages a team of 5"
```

`super.getDetails()` calls `Employee`'s original method, and `Manager` builds on top of it rather than duplicating the logic.

---

## Multi-Level Inheritance

Inheritance chains can go more than one level deep.

```javascript
class Vehicle {
  constructor(wheels) {
    this.wheels = wheels;
  }
  describe() {
    return `A vehicle with ${this.wheels} wheels`;
  }
}

class Car extends Vehicle {
  constructor(brand) {
    super(4);
    this.brand = brand;
  }
  describe() {
    return `${super.describe()}, made by ${this.brand}`;
  }
}

class SportsCar extends Car {
  constructor(brand, topSpeed) {
    super(brand);
    this.topSpeed = topSpeed;
  }
  describe() {
    return `${super.describe()}, top speed ${this.topSpeed}km/h`;
  }
}

const ferrari = new SportsCar("Ferrari", 340);
console.log(ferrari.describe());
// "A vehicle with 4 wheels, made by Ferrari, top speed 340km/h"
```

Each level adds its own detail while reusing everything above it — `SportsCar` → `Car` → `Vehicle`.

---

## Overriding vs. Extending Behavior

```javascript
class Shape {
  getArea() {
    return 0;
  }
  describe() {
    return `Area: ${this.getArea()}`;
  }
}

class Square extends Shape {
  constructor(side) {
    super();
    this.side = side;
  }
  // Full override — parent's getArea() (returns 0) is replaced entirely
  getArea() {
    return this.side ** 2;
  }
}

const sq = new Square(5);
console.log(sq.describe()); // "Area: 25"
```

Notice `describe()` isn't overridden at all — `Square` inherits it as-is, and it automatically works correctly because it calls `this.getArea()`, which resolves to `Square`'s version at runtime. This is **polymorphism** working hand-in-hand with inheritance (see below).

---

## Static Members and Inheritance

`static` methods/properties belong to the class itself, not instances — and they're inherited too.

```javascript
class Shape {
  static description = "A geometric figure";

  static create(type, ...args) {
    if (type === "circle") return new Circle(...args);
    throw new Error("Unknown shape");
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }
}

console.log(Circle.description); // "A geometric figure" — inherited static property
const c = Shape.create("circle", 5);
console.log(c instanceof Circle); // true
```

---

## Checking Inheritance: `instanceof` and Prototypes

```javascript
class Animal {}
class Dog extends Animal {}

const d = new Dog();

console.log(d instanceof Dog); // true
console.log(d instanceof Animal); // true — Dog inherits from Animal
console.log(d instanceof Object); // true — everything inherits from Object

console.log(Object.getPrototypeOf(Dog) === Animal); // true — confirms the class chain
```

Under the hood, `extends` wires up JavaScript's **prototype chain** — when you call `d.someMethod()`, the engine looks for `someMethod` on `Dog.prototype` first, then walks up to `Animal.prototype`, then `Object.prototype`, until it's found (or throws `TypeError`).

---

## Composition as an Alternative (Important Caveat)

Inheritance is powerful but easy to overuse. A common trap is modeling relationships that don't actually fit an "is-a" hierarchy.

```javascript
// Awkward inheritance — a Robot is not really an Animal
class Animal {
  eat() {
    console.log("eating");
  }
}
class Robot extends Animal {
  eat() {
    /* robots don't eat — this override is a code smell */
  }
}
```

```javascript
// Composition — build behavior out of small reusable pieces instead
const canWalk = (state) => ({
  walk: () => console.log(`${state.name} is walking`),
});
const canFly = (state) => ({
  fly: () => console.log(`${state.name} is flying`),
});

function createBird(name) {
  const state = { name };
  return Object.assign({}, state, canWalk(state), canFly(state));
}

const sparrow = createBird("Sparrow");
sparrow.walk(); // "Sparrow is walking"
sparrow.fly(); // "Sparrow is flying"
```

The well-known guideline is **"favor composition over inheritance"** — use `extends` for genuine _is-a_ relationships (`Dog` _is an_ `Animal`), and composition/mixins for _can-do_ capabilities that don't naturally form a strict hierarchy (a `Robot` might share behavior with an `Animal` without truly _being_ one).

---

## Mixins: Simulating Multiple Inheritance

JavaScript classes can only `extends` **one** parent — no multiple inheritance. Mixins work around this by merging behavior into a class.

```javascript
const Swimmer = (Base) =>
  class extends Base {
    swim() {
      console.log(`${this.name} is swimming`);
    }
  };

const Flyer = (Base) =>
  class extends Base {
    fly() {
      console.log(`${this.name} is flying`);
    }
  };

class Animal {
  constructor(name) {
    this.name = name;
  }
}

// Compose multiple behaviors onto Animal
class Duck extends Flyer(Swimmer(Animal)) {}

const duck = new Duck("Duck");
duck.swim(); // "Duck is swimming"
duck.fly(); // "Duck is flying"
```

Each mixin is a function that takes a base class and returns a new class extending it — stacking them lets a single class pick up multiple independent capabilities.

---

## Why Inheritance Matters in Practice

| Benefit                  | Explanation                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Code reuse**           | Shared logic lives in one place (the parent) instead of being copy-pasted across subclasses.                               |
| **Consistent interface** | Subclasses automatically support any method defined on the parent.                                                         |
| **Polymorphism**         | Code written against the parent type (`Shape`) works correctly for any subclass (`Circle`, `Square`) without modification. |
| **Extensibility**        | Adding a new subclass doesn't require touching existing code.                                                              |

**Caveat:** deep inheritance chains can become rigid and hard to change — a change to a base class can ripple through every subclass. This is why many style guides recommend keeping hierarchies shallow (1–2 levels) and reaching for composition when relationships get complicated.

---

## Putting It All Together (All Four Concepts)

```javascript
class Employee {
  #salary; // encapsulation

  constructor(name, salary) {
    this.name = name;
    this.#salary = salary;
  }

  // abstraction — simple interface hiding raise-calculation complexity
  giveRaise(percent) {
    this.#salary *= 1 + percent / 100;
  }

  getSalary() {
    return this.#salary;
  }

  describe() {
    return `${this.name} earns $${this.getSalary().toFixed(2)}`;
  }
}

// inheritance — Manager IS an Employee, plus extra behavior
class Manager extends Employee {
  constructor(name, salary, team) {
    super(name, salary);
    this.team = team;
  }

  describe() {
    return `${super.describe()} and manages ${this.team.length} people`; // polymorphism
  }
}

const manager = new Manager("Alice", 80000, ["Bob", "Carol"]);
manager.giveRaise(10);
console.log(manager.describe());
// "Alice earns $88000.00 and manages 2 people"
```

- **Encapsulation**: `#salary` can't be touched directly from outside.
- **Abstraction**: `giveRaise()` hides the math; callers just say "give a raise."
- **Inheritance**: `Manager` reuses everything from `Employee` without rewriting it.
- **Polymorphism**: `super.describe()` calls the parent's logic, then `Manager` builds on it.
