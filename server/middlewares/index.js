import expressJwt from "express-jwt";

// req.user
export const requireSignin = expressJwt({
  //
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});
