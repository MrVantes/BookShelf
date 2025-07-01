"use client";

import React, { use, useRef, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";
import { Library } from "lucide-react";
import { useRouter } from "next/navigation";

const Cover = () => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    setUploadSuccess(false);

    const filePath = `covers/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("bookcovers")
      .upload(filePath, file);

    if (error) {
      setError(error.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData, error: publicUrlError } = supabase.storage
      .from("bookcovers")
      .getPublicUrl(filePath);

    if (publicUrlError) {
      setError(publicUrlError.message);
      setUploading(false);
      return;
    }

    setImageUrl(publicUrlData.publicUrl);
    setUploading(false);
    setUploadSuccess(true);  // Set success state here
  };

    const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div onClick={() => router.push("/")} className="cursor-pointer flex items-center gap-2 text-center font-bold text-2xl text-gray-800">
          <Library className="h-7 w-7" />
          <span >BookShelf</span>
        </div>
        <p className="text-gray-500 text-xs mt-1">
          A curated list of books from supabase
        </p>
      </div>

      {/* Upload Card */}
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          📚 Upload a Book Cover
        </h1>

        {/* Upload Button */}
        <div className="text-center mb-6">
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-block flex items-center gap-1 border-1 border-gray-200 hover:bg-slate-200 px-3 py-1.5 rounded-md shadow transition font-medium"
          >
            Choose Image
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </div>

        {/* Feedback */}
        {uploading && (
          <p className="text-center text-gray-500">Uploading...</p>
        )}
        {error && (
          <p className="text-center text-red-600 font-medium">{error}</p>
        )}
        {uploadSuccess && !uploading && !error && (
          <p className="text-center text-green-600 font-medium">
            Upload successful!
          </p>
        )}

        {/* Image Preview */}
        {imageUrl && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="font-medium text-gray-800">Preview:</p>
            <img
              src={imageUrl}
              alt="Uploaded cover"
              className="w-60 h-90 object-cover rounded-md border border-gray-200 shadow-sm"
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default Cover;
