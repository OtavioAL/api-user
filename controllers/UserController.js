const dotenv = require("dotenv");

dotenv.config();

const User = require("../models/User");
const PasswordToken = require("../models/PasswordToken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

class UserController {
  async index(req, res) {
    const users = await User.findAll();
    return res.status(200).json({
      users,
    });
  }

  async create(req, res) {
    const { email, name, password } = req.body;

    const validateFields = [
      { field: "email", error: "invalid email", value: email },
      { field: "name", error: "name field is required", value: name },
      {
        field: "password",
        error: "password field is required",
        value: password,
      },
    ];

    for (const { field, error, value } of validateFields) {
      if (!value?.length) {
        return res.status(400).json({ error });
      }
    }

    const emailExists = await User?.findEmail(email);

    if (emailExists)
      return res.status(409).json({
        error: "email already exists",
      });

    await User.create(email, password, name);

    return res.status(200).send("OK!");
  }

  async remove(req, res) {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "bad request" });

    const result = await User.delete(id);

    if (result) {
      if (result?.status) return res.status(200).send("OK");
      else return res.status(400).json(result);
    } else return res.status(400).json({ error: "bad request" });
  }

  async findUser(req, res) {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "bad request" });

    const user = await User.findById(id);

    if (!user) return res.status(404).json({ error: "user not found" });

    return res.status(200).json({ user });
  }

  async edit(req, res) {
    const { id } = req.params;
    const { name, role, email } = req.body;

    const result = await User.update(id, email, name, role);

    if (result) {
      if (result.status) return res.status(200).send("OK");
      else return res.status(400).json(result);
    } else return res.status(400).json({ error: "bad request" });
  }

  async recoverPassword(req, res) {
    const { email } = req.body;

    const result = await PasswordToken.create(email);

    if (result) {
      if (result?.status)
        //Fazer o envio do email para o cliente
        return res.status(200).send("OK");
      else return res.status(400).json(result);
    } else return res.status(400).json({ error: "bad request" });
  }

  async changePassword(req, res) {
    const { token, password } = req.body;

    const result = await PasswordToken.validate(token);

    if (result) {
      if (result?.status) {
        await User.changePassword(password, result.token.user_id, token);
        await PasswordToken.setUsed(token);
        return res.status(200).send("OK");
      } else return res.status(400).json(result);
    } else return res.status(400).json({ error: "bad request" });
  }

  async login(req, res) {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);

    if (!user) return res.status(404).json({ error: "user not found." });

    const result = await bcrypt.compare(password, user.password);

    if (!result) return res.status(401).json({ error: "unauthorized" });

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET
    );

    return res.status(200).json({ token });
  }
}

module.exports = new UserController();
