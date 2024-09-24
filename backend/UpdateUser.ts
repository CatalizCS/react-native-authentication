import { User } from "@/types/User";
import Axios from "@/utils/Axios";
import handleError from "@/utils/handleError";

export default async function UpdateUser(user: User) {
  try {
    await Axios.patch(`/${user.id}`, {
      fields: {
        name: { stringValue: user.name },
        email: { stringValue: user.email },
        age: { integerValue: user.age },
        createdAt: { timestampValue: user.createdAt },
        updatedAt: { timestampValue: user.updatedAt },
      },
    });
    console.log(`User with ID ${user.id} has been updated.`);
  } catch (err: unknown) {
    handleError(err as Error, console.error);
  }
}
