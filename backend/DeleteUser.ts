import Axios from "@/utils/Axios";
import handleError from "@/utils/handleError";

export default async function DeleteUser(userId: string) {
  try {
    await Axios.delete(`/${userId}`);
    console.log(`User with ID ${userId} has been deleted.`);
  } catch (err: unknown) {
    handleError(err as Error, console.error);
  }
}
