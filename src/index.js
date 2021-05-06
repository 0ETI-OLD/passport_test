const users = [
  { id: 1, email: "batman@gmail.com", username: "remi", password: "1231" },
  {
    id: 2,
    email: "flanchan012@gmail.com",
    username: "flan",
    password: "flanpan",
  },
];

const jwt = require("jsonwebtoken");
const JWTPrivateKey = require("./secret");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;

const app = require("express")();

app.use(require("serve-static")("/public"));
app.use(require("cookie-parser")());
app.use(require("body-parser").json());
app.use(passport.initialize());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
      session: false,
    },
    function (req, email, password, done) {
      console.log(req.body);

      console.log(email, password);

      // return done(null, false);

      const user = users.find((user) => user.email === email);
      if (!user) {
        return done(null, false, { message: "User doesn't exist" });
      }
      if (password !== user.password) {
        return done(null, false, { message: "Incorrect password" });
      }

      return done(null, user);
    }
  )
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // jwtFromRequest: (req) => {
      //   console.log("SANITY CHECK 1");
      //   console.log(req.headers.authorization.split(" ")[1]);
      //   return req.headers.authorization.split(" ")[1];
      // },
      secretOrKey: JWTPrivateKey,
    },
    function (payload, done) {
      // CHeck if user exists
      user = users.find((user) => user.email === payload.user.email);
      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    }
  )
);

app.get("/jwt", (req, res) => {
  return res.json({
    stuff: jwt.sign({ test: "test" }, JWTPrivateKey, { expiresIn: 3 }),
  });
});

app.post("/jwt", (req, res) => {
  const { token } = req.body;

  payload = jwt.verify(token, JWTPrivateKey);
  return res.json({ payload });
});

app.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    console.log(req.user);

    const { password, ...userNoPass } = req.user;
    const token = jwt.sign({ user: userNoPass }, JWTPrivateKey, {
      // expiresIn: 60 * 60,
    });

    console.log("INSANITY CEHKH");

    return res.json({ token });
  }
);

app.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("SANITY CHECK @");
    console.log(req.headers.authorization.split(" ")[1]);
    return res.json({ msg: "PROTECTED ROUTE" });
  }
);

app.listen(3000, () => {
  console.log("SERVER STARTED");
});
