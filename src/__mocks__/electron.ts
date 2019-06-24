import { BrowserWindow } from "electron";

const genMock = <TSrc extends any>(t: TSrc) => {
  Object.getOwnPropertyNames(t).forEach((e) => {
    if (typeof t[e] === "function") {
      t[e] = jest.fn();
    }
  });
};

module.exports = {
  BrowserWindow: () => {
    return genMock(BrowserWindow);
  },
  desktopCapturer: {
    getSources: jest.fn(),
  },
};
