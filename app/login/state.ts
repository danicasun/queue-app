export type SignInState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialSignInState: SignInState = {
  status: "idle",
  message: ""
};
