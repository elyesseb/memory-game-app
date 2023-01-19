import type { NextApiRequest, NextApiResponse } from "next";
import { executeQuery } from "./utils/executeQuery";

type Image = {
  id: number;
  label: string;
  url: string;
};

type Data = Image[];

type ErrorResponse = {
  error: string;
};

type ResponseData = Data | ErrorResponse;

// Fonction qui gère la route '/api/images'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Sélectionne toutes les images de la base de données
  const images = await executeQuery<Image>(
    `SELECT * FROM "public"."image" ORDER BY id ASC`
  );

  if (Array.isArray(images)) {
    // Transforme les lignes sélectionnées en un tableau d'images
    const imageData = images.map((image: Image) => ({
      id: image.id,
      label: image.label,
      url: image.url,
    }));
  
    // Envoie le tableau d'images au client
    res.status(200).json(imageData);
  } else {
    res.status(500).json({ error: "Unexpected result from query" });
  }
}