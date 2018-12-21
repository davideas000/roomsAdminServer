const connect = jest.fn();

const connection = jest.fn().mockImplementation(() => {
  return {
    on: jest.fn(),
    once: jest.fn()
  };
});

const Schema = jest.fn().mockImplementation(() => {
  return {
    pre: jest.fn(),
    methods: jest.fn()
  };
});

const model = jest.fn();

module.exports = {
  connect: connect,
  connection: new connection(),
  Schema: Schema,
  model: model
};
