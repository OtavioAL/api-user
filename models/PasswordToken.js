const knex = require("../database/connection");
const User = require("./User");

class PasswordToken {
  async create(email) {
    const user = await User.findByEmail(email);

    if (!user) return { status: false, error: "user not found." };

    try {
      const token = Date.now();
      await knex
        .insert({
          user_id: user.id,
          used: 0,
          token,
        })
        .table("passwordtokens");

      return {
        status: true,
        token,
      };
    } catch (error) {
      return { status: false, error };
    }
  }

  async validate(token) {
    try {
      const result = await knex
        .select()
        .where({ token })
        .table("passwordtokens");

      if (!result) return { status: false, error: "not found." };

      const tk = result[0];

      if (tk.used) return { status: false, error: "invalid token." };

      return {
        status: true,
        token: tk,
      };
    } catch (error) {
      return { status: false, error };
    }
  }

  async setUsed(token) {
    try {
      await knex.update({ used: 1 }).where({ token }).table("passwordtokens");
    } catch (error) {
      return { status: false, error };
    }
  }
}

module.exports = new PasswordToken();
