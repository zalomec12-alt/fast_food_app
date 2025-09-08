import { CreateUserParams, GetMenuParams, SignInParams } from './../type.d';

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
  Storage
} from "react-native-appwrite";

// Configuración de Appwrite
export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!, 
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  platform: "jsm_food_ordering",
  databaseId: '68b35a8300313d7ca450',
  bucketId:'68be16aa0028cd1ad79c',
  userCollectionId: '652fc2aabc1234f6789a',
  categoriesCollectionId: '6530a1d9de4f7b3c1e8f',
  menuCollectionId: '64f1c3a7b8e5a2c4d7f9',
  customizationsCollectionId: '64f1c5d2e3a7b6c8f1e0',
  menuCustomizationsCollectionId: '64f1c7b9d4e2a9c7b3f5'
};

// Inicialización del cliente
export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId);

// Instancias de servicios
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

// ------------------------
// FUNCIONES
// ------------------------

// Función para iniciar sesión
export const signIn = async ({ email, password }: SignInParams) => {
  try {
    return await account.createEmailPasswordSession(email, password);
  } catch (e: any) {
    console.error("Error iniciando sesión:", e.message || e);
    throw new Error(e?.message || "Error al iniciar sesión");
  }
};

// Función para crear un nuevo usuario con manejo de sesión activa
export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams): Promise<Models.Document | null> => {
  try {
    console.log("🚀 Iniciando creación de usuario...");

    console.log("Endpoint:", appwriteConfig.endpoint);
    console.log("Project ID:", appwriteConfig.projectId);
    console.log("Database ID:", appwriteConfig.databaseId);
    console.log("User Collection ID:", appwriteConfig.userCollectionId);

    // 1️⃣ Crear usuario en Appwrite Auth
    const newAccount = await account.create(ID.unique(), email, password, name);
    console.log("✅ Cuenta creada:", newAccount.$id);

    if (!newAccount) throw new Error("Error al crear la cuenta en Appwrite");

    // 2️⃣ Manejar sesión activa
    try {
      await account.get();
      console.log("⚠️ Sesión ya activa, no se crea nueva sesión");
    } catch {
      await signIn({ email, password });
      console.log("✅ Sesión iniciada correctamente");
    }

    // 3️⃣ Generar avatar
    const avatarUrl = `${appwriteConfig.endpoint}/avatars/initials?name=${encodeURIComponent(name)}`;
    console.log("Avatar URL:", avatarUrl);

    // 4️⃣ Crear documento en la base de datos
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
    console.log("✅ Documento del usuario creado:", newUser.$id);

    console.log("🎉 Usuario creado exitosamente");
    return newUser;

  } catch (e: any) {
    console.error("❌ Error creando usuario:", e.message || e);
    return null;
  }
};

// Función para obtener el usuario actual
export const getCurrentUser: () => Promise<Models.Document | null> = async () => {
  try {
    // 1️⃣ Obtener cuenta actual
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("No hay usuario autenticado");

    // 2️⃣ Buscar el documento de usuario en la base de datos
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0)
      throw new Error("Usuario no encontrado");

    return currentUser.documents[0];
  } catch (e: any) {
    console.error("Error obteniendo usuario actual:", e.message || e);
    return null;
  }
};

export const getMenu = async ({category, query }: GetMenuParams) => {
  try{
    const queries: string[] = [];

    if(category)queries.push(Query.equal('categories', category));
    if(query) queries.push(Query.search('name', query));

    const menus: Models.DocumentList<Models.Document> = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      queries,
    )

    return menus.documents;
  }catch (e){
    throw new Error(e as string);
  }
}

export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId
    )

    return categories.documents; 
  } catch (e) {
    throw new Error(e as string);
  }
};
