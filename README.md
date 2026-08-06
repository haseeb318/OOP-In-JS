# Object-Oriented Programming (OOP) in JavaScript

This repository explores **Object-Oriented Programming (OOP)** concepts in JavaScript. OOP is a programming paradigm that organizes code around **objects** — entities that contain both **data** (properties) and **behavior** (methods).

---

## Table of Contents

1. [What is OOP?](#what-is-oop)
2. [Key Concepts](#key-concepts)
3. [The Four Pillars of OOP](#the-four-pillars-of-oop)
4. [Why Use OOP?](#why-use-oop)
5. [Running the Code](#running-the-code)

---

## What is OOP?

OOP is a way of structuring code that models real-world things as **objects**. Instead of writing standalone functions and variables, you group related data and functions together into **classes** and build multiple **objects** from them.

Think of it like a **cookie cutter**:

- **Class** = the cookie cutter (the blueprint/template).
- **Object** = the actual cookies (real things made from the template).

---

## Key Concepts

| Concept         | Description                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| **Class**       | A blueprint or template for creating objects. Defines what properties and methods the objects will have.   |
| **Object**      | A specific instance of a class. Holds actual values for the properties.                                    |
| **Constructor** | A special method that runs automatically when a new object is created. Used to initialize property values. |
| **`this`**      | A keyword that refers to the current object being created or used.                                         |
| **`new`**       | The keyword used to create a new instance of a class.                                                      |
| **Method**      | A function defined inside a class that describes a behavior of the object.                                 |

---

## The Four Pillars of OOP

OOP is built on four core principles. This example touches on **Encapsulation**, and the others will be added in later examples.

### 1. Encapsulation

Bundling data and the methods that operate on that data together inside a class, and hiding internal details.

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  introduce() {
    console.log(`Hi, I'm ${this.name}.`);
  }
}
```

### 2. Abstraction

Hiding complex implementation details and showing only the essential features.

```javascript
person1.introduce(); // We don't need to know HOW it prints, just that it does.
```

### 3. Inheritance

Creating new classes based on existing ones, reusing their code.

```javascript
class Student extends Person {
  constructor(name, age, grade) {
    super(name, age); // Calls the parent constructor
    this.grade = grade;
  }
}
```

### 4. Polymorphism

The ability of objects of different classes to respond to the same method call in their own way.

```javascript
class Teacher extends Person {
  introduce() {
    console.log(`Hi, I'm ${this.name} and I teach.`);
  }
}
```

---

## Why Use OOP?

- ✅ **Reusability** — Classes can be reused to create many objects (e.g., many `Person`s).
- ✅ **Organization** — Related data and functions are grouped together.
- ✅ **Maintainability** — Easier to update and debug since code is modular.
- ✅ **Real-world modeling** — Maps naturally to real-world entities.
- ✅ **Scalability** — Easy to build on top of via inheritance and composition.

---

---

## Folder Structure

```
oop in js/
├── class-and-object.js   # Class & Object example
└── README.md             # This documentation
```
