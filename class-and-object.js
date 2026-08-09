// class
class Person {
  constructor(name, age) {
    ((this.name = name), (this.age = age));
  }
  introduce() {
    console.log(`Hi, my name is ${this.name} and I am ${this.age} years old.`);
  }
}

// Object (instance of the class)
const person1 = new Person("Alice", 25);

// access properties
console.log(person1.name);
console.log(person1.name);

// Call method
person1.introduce();

// Explanation;

// Class (Person): A blueprint for creating objects.
// Constructor: Runs automatically when a new object is created and initializes properties.
// this: Refers to the current object being created or used.
// Object (person1): A specific instance of the Person class created using new.
