const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const colors = require("colors");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanatize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const fileuploade = require("express-fileupload");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const { getAds } = require("./middleware/getAds");
// getAds();
// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

const app = express();

const corsOptions = {
  origin: "http://192.168.1.120:3001",
  credentials: true,
};

//Middleware
app.use(cors(corsOptions));
app.use(express.json());
//Cookie Parser
app.use(cookieParser());
//set Security Header
app.use(helmet());
//XSS-CLEAN
app.use(xss());
//Use Mongoo Sanatize
app.use(mongoSanatize());
//File Uploade
app.use(fileuploade());
//set static folder
app.use(express.static(path.join(__dirname, "images")));

app.get("/", (req, res, next) => {
  res.send("Welcome");
});

app.use("/api/v1/category", require("./Routes/Category.Routes"));
app.use("/api/v1/address", require("./Routes/Address.Routes"));
app.use("/api/v1/user", require("./Routes/User.Routes"));
app.use("/api/v1/client", require("./Routes/Client.Routes"));
app.use("/api/v1/employee", require("./Routes/Employee.Routes"));
app.use("/api/v1/packege", require("./Routes/HappyPackege.Routes"));
app.use("/api/v1/brand", require("./Routes/Brand.Routes"));
app.use("/api/v1/ads", require("./Routes/Ads.Routes"));
app.use("/api/v1/store", require("./Routes/Store.Routes"));
app.use("/api/v1/gift", require("./Routes/Gift.Routes"));
app.use("/api/v1/verfication", require("./Routes/Verfication.Routes"));
app.use("/api/v1/ubp", require("./Routes/UserBrandPoint.Routes"));
app.use("/api/v1/notification", require("./Routes/Notification.Routes"));

app.use(errorHandler);

const server = app.listen(process.env.PORT, () => {
  console.log(`SERVER RUNNING ON PORT = ${process.env.PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
