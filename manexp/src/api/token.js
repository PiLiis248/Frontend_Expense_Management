export const localToken = {
  get: () => JSON.parse(localStorage.getItem("authData")),
  set: (data) => localStorage.setItem("authData", JSON.stringify(data)),
  remove: () => localStorage.removeItem("authData"),
};

export const sessionToken = {
  get: () => JSON.parse(sessionStorage.getItem("authData")),
  set: (data) => sessionStorage.setItem("authData", JSON.stringify(data)),
  remove: () => sessionStorage.removeItem("authData"),
};

const tokenMethod = {
  get: () => {
    return sessionToken.get() || localToken.get();
  },
  set: (data, rememberMe = false) => {
    if (rememberMe) {
      localToken.set(data);
    } else {
      sessionToken.set(data);
    }
  },
  remove: () => {
    localToken.remove();
    sessionToken.remove();
  },
  getToken: () => {
    return tokenMethod.get()?.token || null;
  }
};

export default tokenMethod;
