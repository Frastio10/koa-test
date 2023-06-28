const timeRule = ({
  second = "*",
  minute = "*",
  hour = "*",
  date = "*",
  month = "*",
  day = "*",
}) => {
  return `${second} ${minute} ${hour} ${date} ${month} ${day}`;
};

export default {
  testCron: {
    task: async () => {
    },
    options: {
      rule: timeRule({ second: "*/1" }),
    },
  },
  };
