import { CreateUserParams, SignInParams } from "@/type";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Models,
  Permission,
  Query,
  Role,
} from "react-native-appwrite";

// Configuración de Appwrite
export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!, // https://fra.cloud.appwrite.io/v1
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: "68b35a8300313d7ca450",
  userCollectionId: "652fc2aabc1234f6789a",
};

// Inicialización del cliente
export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

// Instancias de servicios
export const account = new Account(client);
export const databases = new Databases(client);
const avatars = new Avatars(client);

// Función para crear un nuevo usuario
export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams): Promise<Models.Document> => {
  try {
    // 1. Crear usuario en el sistema de autenticación
    const newAccount: Models.User<Models.Preferences> = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    if (!newAccount) throw new Error("Error al crear cuenta");

    // 2. Iniciar sesión para obtener sesión activa
    await signIn({ email, password });

    // 3. Generar una URL válida de avatar (iniciales del nombre)
    const avatarUrl = `${appwriteConfig.endpoint}/avatars/initials?name=${encodeURIComponent(name)}`;

    // 4. Crear documento del usuario en la base de datos
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        email,
        name,
        accountId: newAccount.$id,
        avatar: avatarUrl,
      },
      [
        Permission.read(Role.user(newAccount.$id)),
        Permission.update(Role.user(newAccount.$id)),
        Permission.delete(Role.user(newAccount.$id)),
      ]
    );

    return newUser;
  } catch (e: any) {
    console.error("Error creando usuario:", e);
    throw new Error(e?.message || "Error desconocido al crear usuario");
  }
};

// Función para iniciar sesión
export const signIn = async ({ email, password }: SignInParams) => {
  try {
    return await account.createEmailPasswordSession(email, password);
  } catch (e: any) {
    console.error("Error iniciando sesión:", e);
    throw new Error(e?.message || "Error al iniciar sesión");
  }
};

// Función corregida para obtener el usuario actual
export const getCurrentUser: () => Promise<Models.Document> = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No hay usuario autenticado");

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0)
      throw new Error("Usuario no encontrado");

    return currentUser.documents[0];
  } catch (e: any) {
    console.log(e);
    throw new Error(e.message || "Error desconocido al obtener usuario");
  }
};
