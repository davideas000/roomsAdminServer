const express = jest.fn();

const app = jest.fn().mockImplementation(() => {
  return {
    use: jest.fn()
  };
});

express.mockReturnValue(new app());

module.exports = express;
