import User from "../models/user.model";
import { FindOptions, Model } from "sequelize";

export async function getUsers(
  query: FindOptions,
  page?: number,
  limit?: number
) {
  const user = await User.findAll(query);
  return user;
}

export async function getUser(query: FindOptions) {
  const user = await User.findOne(query);
  return user;
}

export async function getUserById(id: string) {
  const user = await User.findOne({ where: { id } });
  return user;
}
