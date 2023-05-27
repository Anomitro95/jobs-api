const jwt = require("jsonwebtoken");
const {UnauthenticatedError} = require("../errors");

const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //error message : Invalid credentials to access this route
    throw new UnauthenticatedError("No Authorization or token provided");
  }
  //getting only the token from string array after split having strings [Bearer, token]
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach the user to the job routes
    //payload will have the useId and name properties, same as what was set, while creating the JWT token in UserSchema
    req.user = { userId :payload.userId, name:payload.name };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication is invalid");
  }
};

module.exports = authenticationMiddleware;
