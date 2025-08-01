import express from "express";


const router = express.Router();

router.post("/zestoreregister",async (req,res)=>{
    const {userid,username,email,mobile,password} = req.body;
   try{
     const db  = req.db;
    const users =  db.collection("zestoreusers");
    const userdata = await users.insertOne({userid,username,email,mobile,password});
    res.send("user Added ...");
   }catch(err){
    console.log("user miss");
   }
});

router.post('/zestorelogin', async (req, res) => {
  try {
    const db = req.db;
    const usersCollection = db.collection("zestoreusers");

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Email not found' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // ✅ Login successful
    res.status(200).json({
      message: 'Login successful',
      user: {
        username: user.username,
        email: user.email,
        mobile: user.mobile
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get("/zestorelogin",async (req,res)=>{
  
   try{
     const db  = req.db;
    const users =  db.collection("zestoreusers");
    const userdata = await users.find().toArray();
    res.send(userdata);
   }catch(err){
    console.log("user miss");
   }
});
router.get("/zestoreprofile/:email",async (req,res)=>{
  const Email = req.params.email;
   try{
     const db  = req.db;
    const users =  db.collection("zestoreusers");
    const userdata = await users.find({email:Email}).toArray();
    res.send(userdata);
   }catch(err){
    console.log("user miss");
   }
});

router.get("/zestorelogin/:email/:password", async (req, res) => {
  const { username ,mobile,email,password } = req.params;

  try {
    const db = req.db;
    const users = db.collection("zestoreusers");

    const user = await users.findOne({ email, password });

    if (user) {
      res.status(200).send(user);
    } else { 
      res.status(401).send({ message: "Invalid credentials" });
    }

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send({ message: "Server error" });
  }
});


export default router;