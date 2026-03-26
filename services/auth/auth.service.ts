type Session = {
  isAuthenticated: boolean;
};

export const authService = {
  getInitialSession(): Session {
    return { isAuthenticated: false };
  },
};
