import { User } from "@/types/User";
import Axios from "@/utils/Axios";
import handleError from "@/utils/handleError";

export default async function AddUser(user: User) {
  try {
    await Axios.post("", {
      fields: {
        name: { stringValue: user.name },
        email: { stringValue: user.email },
        age: { integerValue: user.age },
        createdAt: { timestampValue: user.createdAt },
        updatedAt: { timestampValue: user.updatedAt },
      },
    });
    console.log(`User with ID ${user.id} has been added.`);
  } catch (err: unknown) {
    handleError(err as Error, console.error);
  }
}
