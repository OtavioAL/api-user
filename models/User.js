const knex = require("../database/connection");
const bcrypt = require("bcrypt");

class User {
  async create(email, password, name) {
    try {
      const salt = 10;
      const hash = await bcrypt.hash(password, salt);

      await knex
        .insert({
          email,
          password: hash,
          name,
          role: 0,
        })
        .table("users");
    } catch (error) {
      return { status: false, error };
    }
  }

  async update(id, email, name, role) {
    try {
      const user = await this.findById(id);

      if (!user) return { status: false, error: "user not found." };

      const editUser = {};

      if (email?.length) {
        if (email != user?.email) {
          const result = await this?.findEmail(email);
          if (!result) editUser.email = email;
          else return { status: false, error: "email already exists." };
        }
      }

      if (name?.length) editUser.name = name;

      if (role?.length) editUser.role = role;

      try {
        await knex.update(editUser).where({ id }).table("users");
        return { status: true };
      } catch (error) {
        return { status: false, error };
      }
    } catch (error) {
      console.log("Error", error);
      return { status: false, error };
    }
  }

  async delete(id) {
    try {
      const user = await this.findById(id);

      if (!user) return { status: false, error: "user not found." };

      await knex.delete().where(id).table("users");

      return { status: true };
    } catch (error) {
      return { status: false, error };
    }
  }

  async findEmail(email) {
    try {
      const user = await knex.select("*").from("users").where({ email });

      return !!user?.length;
    } catch (error) {
      console.log("Error", error);
      return false;
    }
  }
  async findById(id) {
    try {
      const user = await knex
        .select(["id", "email", "name", "role"])
        .from("users")
        .where({ id });

      return user?.length ? user[0] : undefined;
    } catch (error) {
      console.log("Error", error);
      return undefined;
    }
  }

  async findByEmail(email) {
    try {
      const user = await knex
        .select(["id", "email", "name", "role", "password"])
        .from("users")
        .where({ email });

      return user?.length ? user[0] : undefined;
    } catch (error) {
      console.log("Error", error);
      return undefined;
    }
  }

  async findAll() {
    try {
      const users = await knex
        .select(["id", "email", "name", "role"])
        .from("users");

      return users;
    } catch (error) {
      console.log("Error", error);
      return [];
    }
  }

  async changePassword(newPassword, id, token) {
    const salt = 10;
    const hash = await bcrypt.hash(newPassword, salt);

    try {
      await knex.update({ password: hash }).where({ id }).table("users");
      return { status: true };
    } catch (error) {
      return { status: false, error };
    }
  }
}

module.exports = new User();
