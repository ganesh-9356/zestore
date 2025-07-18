import {client, MongoConnect} from "./MongoDB.js";

try {
  const db = await MongoConnect();
  const command = "collMod";

  await db.command({
    [command]: "users",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["_id", "email", "mobile", "password", "userid", "username"],
        properties: {
          _id: {
            bsonType: "objectId"
          },
          email: {
            bsonType: "string",
            minLength: 8,
            pattern: "^[\\w.-]+@[\\w.-]+\\.\\w{2,}$",
            description: "Must be a valid email address and at least 8 characters"
          },
          mobile: {
            bsonType: "int",
            minimum: 1000000000,
            maximum: 9999999999,
            description: "10-digit mobile number"
          },
          password: {
            bsonType: "string",
            minLength: 6,
            description: "Password must be at least 6 characters"
          },
          userid: {
            bsonType: ["string", "int"],
            description: "Unique identifier"
          },
          username: {
            bsonType: "string",
            minLength: 3,
            description: "User name must be at least 3 characters"
          }
        }
      }
    },
    validationAction: "error",
    validationLevel: "strict"
  });
} catch (err) {
  console.log("Error setting up the database", err);
} finally {
  await client.close();
}
