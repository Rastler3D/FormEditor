import {cloudinary} from "~/lib/cloudinary.ts";

export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinary.uploadPreset);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!response.ok) {
        throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
};