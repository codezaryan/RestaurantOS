export function validateLogin(email?: string, password?: string) {
  if (!email) {
    return "Email is required.";
  }

  if (!password) {
    return "Password is required.";
  }

  return null;
}

export function validateCreateUser(password?: string) {
  if (!password) {
    return "Password is required for new staff members.";
  }

  return null;
}