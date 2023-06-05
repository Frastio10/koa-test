import sequelize from "../../../config/db";
import { DataTypes } from "sequelize";

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: DataTypes.STRING,
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verificationCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  verificationCodeExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

User.sync();

export default User;
