import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(400).json({
      msg: "Token yoq",
      variant: "warning",
      payload: null,
    });
  }

  jwt.verify(
    token.split(" ")[1],
    process.env.SECRET_KEY,
    function (err, decoded) {
      if (err) {
        return res.status(401).json({
          msg: "Token mos emas",
          variant: "warning",
          payload: null,
        });
      } else {
        console.log(decoded);
        req.user = decoded;
        next();
      }
    }
  );
};
