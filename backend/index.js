const express=require("express");
const {connectToMongoDB}=require('./connect');
const urlRoute= require('./routes/url');
const URL = require('./models/url');
const cors = require("cors");
const { handleUserSignup, handleUserLogin } = require('./controllers/user');


const app =express();
// const PORT=5000;
app.use(cors());

// Replace YOUR_NEW_PASSWORD with the one you just reset
const cloudURI = "mongodb+srv://sameer_admin:Sameer%401234@cluster0.eobltps.mongodb.net/short-url?retryWrites=true&w=majority&appName=Cluster0";

connectToMongoDB(cloudURI)
  .then(() => console.log("MongoDB Atlas Connected..."))
  .catch((err) => console.log("Atlas Connection Error: ", err));

app.use(express.json())

app.post('/signup', handleUserSignup);
app.post('/login', handleUserLogin);
app.use("/url",urlRoute)

app.get("/:shortId",async(req,res)=>{
    const shortId =req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        {
            shortId: shortId,
        },
        {
            $push:{
                visitHistory:{
                    timestamp:Date.now(),
                },
            }
        }
    );
    res.redirect(entry.redirectURL);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started at port: ${PORT}`));