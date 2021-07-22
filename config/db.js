const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    // user: "Admin",
    // pass: "18121999",
    // auth: { authSource: "admin" },
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
};

// function makrNewConnection(uri) {
//   const db = mongoose.createConnection(uri, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true,
//   });

//   db.on("error", function (error) {
//     console.log(`MongoDB :: connection ${this.name} ${JSON.stringify(error)}`);
//     db.close().catch(() =>
//       console.log(`MongoDB :: failed to close connection ${this.name}`)
//     );
//   });

//   db.on("connected", function () {
//     mongoose.set("debug", function (col, method, query, doc) {
//       console.log(
//         `MongoDB :: ${this.conn.name} ${col}.${method}(${JSON.stringify(
//           query
//         )},${JSON.stringify(doc)})`
//       );
//     });
//     console.log(`MongoDB :: connected ${this.name}`);
//   });

//   db.on("disconnected", function () {
//     console.log(`MongoDB :: disconnected ${this.name}`);
//   });

//   return db;
// }

// const HappyHourConnection = makeNewConnection(process.env.MONGO_URI);
// const HappyHourClientConnection = makeNewConnection(process.env.MONGO_URI_CLIENT);

// module.exports = { HappyHourConnection, HappyHourClientConnection };

module.exports = connectDB;
