import { User } from "@/types/User";
import Axios from "@/utils/Axios";
import handleError from "@/utils/handleError";

export default async function FetchUser(): Promise<User[] | void> {
  try {
    const response = await Axios.get("");
    const users = response.data.documents.map((doc: any) => {
      console.log(doc);
      return {
        id: doc.name.split("/").pop(),
        name: doc.fields.name?.stringValue,
        email: doc.fields.email?.stringValue,
        age: doc.fields.age?.integerValue,
        createdAt: new Date(doc.fields.createdAt?.timestampValue),
        updatedAt: new Date(doc.fields.updatedAt?.timestampValue),
      };
    });

    console.log("Users have been fetched.");
    return users;
  } catch (err: unknown) {
    handleError(err as Error, console.error);
  }
}
