


db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "title", "price", "category", "description", "image", "quantity"],
      properties: {
        id: {
          bsonType: "int",
          description: "must be an integer and is required"
        },
        title: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        price: {
          bsonType: "int",
          description: "must be an integer and is required"
        },
        category: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        description: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        image: {
          bsonType: "string",
          pattern: "^https?://", // Basic URL format
          description: "must be a valid URL string and is required"
        },
        quantity: {
          bsonType: "int",
          description: "must be an integer and is required"
        }
      }
    } // this may take a few minutes 16277709737 
  }
});
{
  db.products.createIndex({ id: 1 }, { unique: true });

} 