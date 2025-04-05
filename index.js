require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("./src/middlewares/errorHandler");
const connectDB = require("./src/config/dbConfig");
const userRoutes = require("./src/routes/userRoutes");
const officeRoutes = require("./src/routes/officeRoutes");
const { createDefaultAdmin } = require("./src/controllers/adminController");
const contactRoutes = require("./src/routes/contactRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes")

const app = express();

//Enable This when you are using local host
// Proper CORS Configuration
// app.use(cors({
//   origin: "http://localhost:3000",  // Allow only your frontend
//   methods: "GET, POST, PUT, DELETE",
//   allowedHeaders: "Content-Type, Authorization",
//   credentials: true  
// }));

// // Handle Preflight (OPTIONS) Requests
// app.options("*", cors({
//   origin: "http://localhost:3000",
//   credentials: true
// }));

// // Body parser
// app.use(bodyParser.json());
// app.use(express.json());



//Dsable this when you are using local host
app.use(cors({
  origin: ["https://co-working-frontend-git-main-ritesh-kumars-projects-3aa7a863.vercel.app/", "https://co-working-frontend.vercel.app", "http://localhost:3000/"],
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE"], 
  allowedHeaders: ["Content-Type", "Authorization"], 
}));


app.use(bodyParser.json());
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin","https://co-working-frontend-git-main-ritesh-kumars-projects-3aa7a863.vercel.app", "https://co-working-frontend.vercel.app", "http://localhost:3000/");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});


app.use("/api/user",userRoutes);

app.use("/api/office", officeRoutes);

app.use("/api/contact", contactRoutes);

app.use("/api/payment", paymentRoutes);


const initializeApp = async () => {
  try {
    await connectDB(); 
    await createDefaultAdmin(); 
    console.log("✅ Default admin checked/created.");
  } catch (error) {
    console.error(" Error initializing app:", error);
  }
};

initializeApp();

app.use(errorHandler);


module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

