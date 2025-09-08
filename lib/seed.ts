import { ID, Permission, Role } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

export interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string;
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[];
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
  const list = await databases.listDocuments(
    appwriteConfig.databaseId,
    collectionId
  );
  await Promise.all(
    list.documents.map((doc) =>
      databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
    )
  );
}

async function clearStorage(): Promise<void> {
  const list = await storage.listFiles(appwriteConfig.bucketId);
  await Promise.all(
    list.files.map((file) =>
      storage.deleteFile(appwriteConfig.bucketId, file.$id)
    )
  );
}

async function uploadImageToStorage(imageUrl: string) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const detectedType = blob.type || 'image/png';

  const fileObj = {
    name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
    type: detectedType,
    size: blob.size,
    uri: imageUrl,
  };

  // Subimos el archivo con permiso público de lectura (Role.any())
  const file = await storage.createFile(
    appwriteConfig.bucketId,
    ID.unique(),
    fileObj,
    [Permission.read(Role.any())]  // <-- Permiso público
  );

  return storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
}

async function seed(): Promise<void> {
  try {
    await clearAll(appwriteConfig.categoriesCollectionId);
    await clearAll(appwriteConfig.customizationsCollectionId);
    await clearAll(appwriteConfig.menuCollectionId);
    await clearAll(appwriteConfig.menuCustomizationsCollectionId);
    await clearStorage();

    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.categoriesCollectionId,
        ID.unique(),
        cat
      );
      categoryMap[cat.name] = doc.$id;
    }

    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.customizationsCollectionId,
        ID.unique(),
        {
          name: cus.name,
          price: cus.price,
          type: cus.type,
        }
      );
      customizationMap[cus.name] = doc.$id;
    }

    for (const item of data.menu) {
      const uploadedImage = await uploadImageToStorage(item.image_url);

      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.menuCollectionId,
        ID.unique(),
        {
          name: item.name,
          description: item.description,
          image_url: uploadedImage,  // Aquí guardamos la URL firmada correcta
          price: item.price,
          rating: item.rating,
          calories: item.calories,
          protein: item.protein,
          categories: categoryMap[item.category_name],
        }
      );

      for (const cusName of item.customizations) {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.menuCustomizationsCollectionId,
          ID.unique(),
          {
            menu: doc.$id,
            customizations: customizationMap[cusName],
          }
        );
      }
    }

    console.log("✅ Seeding complete.");
  } catch (err) {
    console.error("❌ Failed to seed the database:", err);
  }
}

export default seed;
