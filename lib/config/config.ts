interface Config {
  mongoUrl: string;
}

export const config = {
  secret: "2c0f489e3a0db99b3c0446f3a812f48b29d0b41631d93a0a6108fb14e7361f40",
  mongoURL: process.env.MONGODB_URI || "mongodb://dev:dev@localhost:27017/dev"
};
