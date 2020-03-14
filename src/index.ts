import {JsonAnyGetter} from './annotations/JsonAnyGetter';
import {JsonProperty, JsonPropertyAccess} from './annotations/JsonProperty';
import {JsonPropertyOrder} from './annotations/JsonPropertyOrder';
import {JsonRawValue} from './annotations/JsonRawValue';
import {JsonValue} from './annotations/JsonValue';
import {JsonRootName} from './annotations/JsonRootName';
import {JsonSerialize} from './annotations/JsonSerialize';
import {JsonCreator} from './annotations/JsonCreator';
import {JsonManagedReference} from './annotations/JsonManagedReference';
import {JsonBackReference} from './annotations/JsonBackReference';
import {JsonAnySetter} from './annotations/JsonAnySetter';
import {JsonDeserialize} from './annotations/JsonDeserialize';
import {JsonIgnore} from './annotations/JsonIgnore';
import {JsonIgnoreProperties} from './annotations/JsonIgnoreProperties';
import {JsonIgnoreType} from './annotations/JsonIgnoreType';
import {JsonInclude} from './annotations/JsonInclude';
import {JsonTypeInfo, JsonTypeInfoAs, JsonTypeInfoId} from './annotations/JsonTypeInfo';
import {JsonTypeName} from './annotations/JsonTypeName';
import {JsonSubTypes} from './annotations/JsonSubTypes';
import {JsonFormat, JsonFormatShape} from './annotations/JsonFormat';
import {JsonView} from './annotations/JsonView';
import {JsonAlias} from "./annotations/JsonAlias";
import {JsonClass} from "./annotations/JsonClass";
import dayjs from "dayjs";
import {ObjectMapper} from "./databind/ObjectMapper";
import {SerializationFeature} from "./databind/SerializationFeature";
import {DeserializationFeature} from "./databind/DeserializationFeature";
import {JsonParser} from "./core/JsonParser";
import {JsonStringifier} from "./core/JsonStringifier";
import {JsonUnwrapped} from "./annotations/JsonUnwrapped";
import {JsonIdentityInfo, ObjectIdGenerator} from "./annotations/JsonIdentityInfo";

class DateSerializer {
  static serializeDate(date) {
    return {
      "year": date.getFullYear(),
      "month": date.getMonth() + 1,
      "day": date.getDate(),
      "formatted": date.toLocaleDateString()
    };
  }
  static deserializeDate(dateObj) {
    return new Date(dateObj.formatted);
  }
}

//@JsonRootName()
//@JsonIgnoreType()
@JsonTypeInfo({use: JsonTypeInfoId.NAME, include: JsonTypeInfoAs.PROPERTY, property: 'example2_type'})
class Example2 {

  name = "";
  age = 55

  @JsonSerialize({using: DateSerializer.serializeDate})
  @JsonDeserialize({using: DateSerializer.deserializeDate})
  date = new Date();

  //@JsonBackReference({class: () => Example3})
  example;

  constructor (name, age, date, example) {
    this.name = name;
    this.age = age;
    this.date = date;
    this.example = example;
  }

  @JsonCreator()
  static creator(name, age, date) {
    return new Example2(name, age, date, null)
  }
  //@JsonValue()
  getValue() {
    return "ciao " + this.name;
  }

}

//@JsonCreator()
//@JsonIgnoreType()
//@JsonRootName()
@JsonPropertyOrder({value: ["example2", "test2", "name"]})
//@JsonInclude({value: JsonInclude.Include.NON_EMPTY})
// @JsonIgnoreProperties({
//   value: ["age", "username"],
//   allowGetters: true
// })
@JsonTypeInfo({use: JsonTypeInfoId.NAME, include: JsonTypeInfoAs.PROPERTY})
@JsonSubTypes({types: [
  {class: () => Example3, name: 'custom_type_name'}
]})
class Example {
  //@JsonIgnore()
  @JsonProperty({value: "username"})
  name = "pippo";

  //@JsonInclude({value: JsonInclude.Include.NON_NULL})
  age = 5;

  mTest = false;
  test2 = false;

  @JsonRawValue()
  @JsonProperty({value: "property_test"})
  testValue = '{"asd": 5}';

  @JsonManagedReference({class: () => Example2})
  example2_references;

  constructor (name, age, test, example2_references) {
    this.name = name;
    this.age = age;
    this.mTest = test;
    this.test2 = !test;
    this.example2_references = example2_references;
  }

  //@JsonAnyGetter({enabled: false})
  testAnyGetter() {
    return {
      "age": this.age,
    }
  }

  @JsonCreator()
  static creator(name2, age, test/*, example2_references*/) {
    return new Example(name2, age, test, null/*, example2_references*/);
  }
}

//@JsonRootName()
@JsonCreator()
//@JsonTypeName({value: "example3"})
class Example3 extends Example {
  new_property = 344443434
}

let test = new Example2("test 1", 20, new Date(), null);
let test2 = new Example2("test 2", 40, new Date(), null);
//let a = new Example("my name", 45, '');
let a = new Example3("my name", null, '', null);
//a.example2_references = [test, test2];
a.example2_references = test;
//let a = new Example("my name", 45, false);
//test.example = a;
//test2.example = a;
a.testValue = "{\"test\": 100}";

// let stringified1 = stringify(test, null, "\t");
// console.log(stringified1)
// console.log(parse(stringified1, null, { mainCreator: Example2, otherCreators: [Example] }));

// let stringified2 = stringify(a, null, "\t");
// console.log(stringified2)
// //console.log(parse(stringified2, null, { mainCreator: Example, otherCreators: [Example2] }));
// console.log(parse(stringified2, null, { mainCreator: Example3, otherCreators: [Example2] }));




@JsonTypeInfo({use: JsonTypeInfoId.NAME, include: JsonTypeInfoAs.PROPERTY})
@JsonSubTypes({types:
  [
    {class: () => Rectangle},
    {class: () => Circle}
  ]
})
class Shape {

}

@JsonTypeName({value: "rectangle"})
class Rectangle extends Shape {
  w;
  h;
  constructor(w, h) {
    super();
    this.w = w;
    this.h = h;
  }
}

@JsonTypeName({value: "circle"})
class Circle extends Shape {
  radius;
  constructor(radius) {
    super();
    this.radius = radius;
  }
}

class View {

  @JsonFormat({
    shape: JsonFormatShape.OBJECT
  })
  @JsonDeserialize({using: (shapes) => {
    return Object.values(shapes);
  }})
  @JsonManagedReference({class: () => Shape})
  shapes = [];
  constructor(shapes) {
    this.shapes = shapes;
  }
}

// let view = new View([]);
// view.shapes = [new Rectangle(10,20), new Circle(5)];
// let stringified4 = stringify(view, null, "\t");
// console.log(stringified4)
// console.log(parse(stringified4, null, { mainCreator: View, otherCreators: [Circle, Rectangle, Shape] }));

class Event {
  name;

  @JsonFormat({
    shape: JsonFormatShape.STRING,
    locale: 'es',
    pattern: "dddd YYYY-MM-DDTHH:mm:ssZ[Z]",
    timezone: "America/New_York"
  })
  @JsonDeserialize({using: (date) => { return dayjs(date, "dddd YYYY-MM-DDTHH:mm:ssZ[Z]").toDate(); }})
  eventDate;
}

// let event = new Event();
// event.name = "Event 1";
// event.eventDate = new Date();
// let stringified5 = stringify(event, null, "\t");
// console.log(stringified5)
// console.log(parse(stringified5, null, { mainCreator: Event }));

class User {
  id;
  name;

  @JsonManagedReference({class: () => Item2})
  userItems2 = [];
  @JsonManagedReference({class: () => Item3})
  userItems3 = [];

  constructor(id, name) {
    this.id = id;
    this.name = name;
  }

  addItem2(item) {
    this.userItems2.push(item);
  }

  addItem3(item) {
    this.userItems3.push(item);
  }

  @JsonCreator()
  static creator(@JsonProperty({value: "username"}) name, @JsonProperty({value: "userId"}) id) {
    const user = new User(id, name);
    return user;
  }

}
class Item2 {
  id;
  itemName;

  @JsonBackReference({class: () => User})
  owner;

  @JsonBackReference({class: () => Item3, value: "item3"})
  item3;

  constructor(id, itemName, owner) {
    this.id = id;
    this.itemName = itemName;
    this.owner = owner;
  }
}
class Item3 {
  id;
  itemName;

  @JsonBackReference({class: () => User})
  owner;
  @JsonBackReference({class: () => User, value: "owner2"})
  owner2;

  @JsonManagedReference({class: () => Item2, value: "item3"})
  item2;

  constructor(id, itemName, owner) {
    this.id = id;
    this.itemName = itemName;
    this.owner = owner;
  }
}

//const user = new User(1, "John 1");
// const user2 = new User(2, "John 2");
// const item2 = new Item2(2, "book 1", user);
// const item3 = new Item3(3, "book 2", user);
// //item3.owner2 = user2;
// item3.item2 = item2;
// //item2.item3 = item3;
// user.addItem2(item2);
// user.addItem3(item3);
//user2.addItem3(item3);
// let stringified7 = stringify(user, null, "\t");
// console.log(stringified7)
// console.log(parse(
//   `{
//   "userId": 1,
//   "username": "John 1"
// }
// `, null, { mainCreator: User});
//console.log(parse(stringified7, null, { mainCreator: User, otherCreators: [Item3, Item2] }));

class TestJsonProperty {
  @JsonAlias({values: ['username']})
  name: string;
}

// const testJsonProperty = new TestJsonProperty();
// testJsonProperty.name = 'test';
// console.log(stringify(testJsonProperty, null, '\t'));
// console.log(parse(`
// {
//         "username": "test"
// }
// `, null, {mainCreator: TestJsonProperty}));

class TestJsonClassUser {
  @JsonProperty({value: 'userId'})
  id: number;
  email: string;
  @JsonSerialize({using: DateSerializer.serializeDate})
  @JsonDeserialize({using: DateSerializer.deserializeDate})
  date = new Date();

  constructor(id, email) {
    this.id = id;
    this.email = email;
  }

  @JsonCreator()
  static creator(email, @JsonProperty({value: 'userId'}) id) {
    return new TestJsonClassUser(id, email);
  }
}

class TestJsonClass {
  @JsonClass({class: () => TestJsonClassUser})
  user: TestJsonClassUser;
}

// const objectMapper = new ObjectMapper();
//
// const tUser = new TestJsonClassUser(1, "pichillilorenzo@gmail.com");
// const testJsonClass = new TestJsonClass();
// testJsonClass.user = tUser;
// const stringified8 = `
// {
//         "user": {
//                 "userId": 1,
//                 "email": "pichillilorenzo@gmail.com",
//                 "date": {
//                         "year": 2020,
//                         "month": 3,
//                         "day": 11,
//                         "formatted": "3/11/2020"
//                 }
//         },
//         "unknown": true
// }
//
// `;
//
// objectMapper.features.serialization[SerializationFeature.FAIL_ON_SELF_REFERENCES] = true;
// objectMapper.features.deserialization[DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES] = true;
//
// const serializer1: ObjectMapperSerializer = {
//   mapper: (key, value) => {
//     value['asd'] = 4;
//     return value;
//   },
//   order: 1,
//   type: TestJsonClassUser
// };
//
// objectMapper.serializers.push(serializer1);
//
// console.log(
//   objectMapper.stringify<TestJsonClass>(testJsonClass, {format: '\t'})
// );
//
// const deserializer1: ObjectMapperDeserializer = {
//   mapper: (key, value) => {
//     if (key === 'user') {
//       const user = new TestJsonClassUser(value.userId + 3, value.email + "lol");
//       user.date = value.date;
//       return user;
//     }
//     return value;
//   },
//   order: 1
// };
// objectMapper.deserializers.push(deserializer1);
//
// console.log(objectMapper.parse<TestJsonClass, TestJsonClass>(stringified8,{mainCreator: TestJsonClass}));

class SpecialItem {
  id;

  @JsonView({value: [() => Views.special]})
  ownerName;

  constructor(id, ownerName) {
    this.id = id;
    this.ownerName = ownerName;
  }
}

class Item {

  @JsonView({value: [() => Views.internal, () => Views.public]})
  id;

  @JsonView({value: [() => Views.public]})
  itemName;

  @JsonClass({class: () => Item})
  relatedItem : Item;

  constructor(id, itemName) {
    this.id = id;
    this.itemName = itemName;
  }
}
class Public {}
class Internal {}
class Special {}
class Views {
  static public = Public;
  static internal = Internal;
  static special = Special;
}
// const objectMapper = new ObjectMapper();
//
// objectMapper.features.serialization[SerializationFeature.FAIL_ON_SELF_REFERENCES] = true;
// objectMapper.features.deserialization[DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES] = true;
//
// let specialItem = new SpecialItem(1, 'Lorenzo');
// let item = new Item(2, "book");
// item.relatedItem = item;
// let stringified6 = objectMapper.stringify<Item>(item, { format: '\t' });
// console.log(stringified6)
// console.log(objectMapper.parse<Item, Item>(stringified6, { mainCreator: Item }));

class Parent {

  @JsonClass({class: () => Name})
  //@JsonUnwrapped({prefix: 'parent-'})
  name: Name;

  age: number;
}
@JsonTypeInfo({use: JsonTypeInfoId.NAME, include: JsonTypeInfoAs.WRAPPER_ARRAY})
class Name {
  last: string;
  first: string;
}

// const objectMapper = new ObjectMapper();
// objectMapper.features.serialization[SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS] = true;
// const parent = new Parent();
// parent.age = 35;
// parent.name = new Name();
// parent.name.first = "Lorenzo";
// parent.name.last = "Pichilli";
// let stringified9 = objectMapper.stringify<Parent>(parent, { format: '\t' });
// console.log(stringified9);
// console.log(objectMapper.parse<Parent, Parent>(stringified9, {mainCreator: Parent}));

@JsonIdentityInfo({generator: ObjectIdGenerator.UUIDv1Generator})
class A {
  id: number;
  name: string;

  @JsonClass({class: () => B, isArray: true})
  b: B[] = [];

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }

}

//@JsonTypeInfo({use: JsonTypeInfoId.NAME, include: JsonTypeInfoAs.WRAPPER_ARRAY})
@JsonIdentityInfo({generator: ObjectIdGenerator.UUIDv1Generator})
class B {
  id: number;
  name: string;

  @JsonClass({class: () => A})
  a: A;

  constructor(id: number, name: string, a: A) {
    this.id = id;
    this.name = name;
    this.a = a;
  }
}

const testA = new A(1, 'Element A');
const testB = new B(2, 'Element B1', testA);
const testB2 = new B(3, 'Element B2', testA);
testA.b.push(testB, testB2);
const objectMapper = new ObjectMapper();
let stringified10 = objectMapper.stringify<A>(testA, { format: '\t' });
console.log(stringified10);
//objectMapper.features.deserialization[DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES] = false;
console.log(objectMapper.parse<A, A>(stringified10, {mainCreator: A}));

exports = {
  JsonAnyGetter,
  JsonProperty,
  JsonPropertyAccess,
  JsonPropertyOrder,
  JsonRawValue,
  JsonValue,
  JsonRootName,
  JsonSerialize,
  JsonCreator,
  JsonManagedReference,
  JsonBackReference,
  JsonAnySetter,
  JsonDeserialize,
  JsonIgnore,
  JsonIgnoreProperties,
  JsonIgnoreType,
  JsonInclude,
  JsonTypeInfo,
  JsonTypeInfoAs,
  JsonTypeInfoId,
  JsonTypeName,
  JsonSubTypes,
  JsonFormat,
  JsonFormatShape,
  JsonView,
  JsonAlias,
  JsonClass,
  JsonUnwrapped,
  JsonParser,
  JsonStringifier,
  ObjectMapper,
  SerializationFeature,
  DeserializationFeature
};