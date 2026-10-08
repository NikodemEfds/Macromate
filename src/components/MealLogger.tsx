import { useState, useRef } from "react";
import {
  Camera,
  Loader2,
  Sparkles,
  X,
  Heart,
} from "lucide-react";
import { MealLog, FavoriteMeal } from "../types";
import { v4 as uuidv4 } from "uuid";

interface MealLoggerProps {
  onLogMeal: (meal: MealLog) => void;
  favorites: FavoriteMeal[];
  date: string;
}

export function MealLogger({
  onLogMeal,
  favorites,
  date,
}: MealLoggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ------------------------------------------------------------
  // Quick log a favourite meal
  // ------------------------------------------------------------

  const logFavorite = (fav: FavoriteMeal) => {
    const newLog: MealLog = {
      id: uuidv4(),
      date,
      name: fav.name,
      description: fav.description,
      calories: fav.calories,
      protein: fav.protein,
      carbs: fav.carbs,
      fat: fav.fat,
      micronutrients: fav.micronutrients,
      components: fav.components,
      imageBase64: fav.imageBase64,
    };

    onLogMeal(newLog);
    setIsOpen(false);
  };

  // ------------------------------------------------------------
  // Process uploaded image
  // ------------------------------------------------------------

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Only accept actual image files
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const source = event.target?.result;

      if (typeof source !== "string") {
        alert("Unable to read the image.");
        return;
      }

      const img = new Image();

      img.onload = () => {
        const MAX_SIZE = 1600;

        let width = img.width;
        let height = img.height;

        // Resize while maintaining aspect ratio
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round(
              (height * MAX_SIZE) / width
            );
            width = MAX_SIZE;
          } else {
            width = Math.round(
              (width * MAX_SIZE) / height
            );
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          alert("Unable to process the image.");
          return;
        }

        // Draw the image onto the resized canvas
        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        // Convert to compressed JPEG
        const compressedImage = canvas.toDataURL(
          "image/jpeg",
          0.8
        );

        setImage(compressedImage);
      };

      img.onerror = () => {
        alert("Unable to process this image.");
      };

      img.src = source;
    };

    reader.onerror = () => {
      alert("Unable to read this image.");
    };

    reader.readAsDataURL(file);

    // Allows the same image to be selected again later
    e.target.value = "";
  };

  // ------------------------------------------------------------
  // Analyse meal with Gemini
  // ------------------------------------------------------------

  const analyzeAndLog = async () => {
    if (isAnalyzing) return;

    if (!description.trim() && !image) {
      alert("Please describe your meal or add a photo.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(
        "/api/analyze-meal",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: description.trim(),
            imageBase64: image,
            mimeType: image
              ? "image/jpeg"
              : undefined,
          }),
        }
      );

      let data: any = null;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Analysis failed (${response.status}).`
        );
      }

      // Make sure the AI returned the information we need
      if (
        !data ||
        typeof data.calories !== "number" ||
        typeof data.protein !== "number" ||
        typeof data.carbs !== "number" ||
        typeof data.fat !== "number"
      ) {
        throw new Error(
          "The AI returned an invalid meal analysis. Please try again."
        );
      }

      const newLog: MealLog = {
        id: uuidv4(),
        date,
        name:
          data.name ||
          description.trim() ||
          "Analysed Meal",
        description: description.trim(),
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        micronutrients:
          Array.isArray(data.micronutrients)
            ? data.micronutrients
            : [],
        components:
          Array.isArray(data.components)
            ? data.components
            : [],
        imageBase64: image || undefined,
      };

      onLogMeal(newLog);

      // Reset form
      setDescription("");
      setImage(null);
      setIsOpen(false);
    } catch (error) {
      console.error(
        "Meal analysis error:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while analysing your meal.";

      alert(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ------------------------------------------------------------
  // Closed state
  // ------------------------------------------------------------

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm shadow-xl shadow-emerald-200/50 transition-all"
      >
        <Sparkles className="w-5 h-5" />
        AI Scan Meal
      </button>
    );
  }

  // ------------------------------------------------------------
  // Open state
  // ------------------------------------------------------------

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-200">
      {/* Close */}
      <button
        onClick={() => {
          if (!isAnalyzing) {
            setIsOpen(false);
          }
        }}
        disabled={isAnalyzing}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Log a Meal
        </h3>
      </div>

      {/* Favourite meals */}
      {favorites && favorites.length > 0 && (
        <div className="mb-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            Quick Log Favorites
          </div>

          <div
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {favorites.map((fav) => (
              <button
                key={fav.id}
                onClick={() => logFavorite(fav)}
                disabled={isAnalyzing}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg whitespace-nowrap hover:bg-emerald-50 hover:border-emerald-200 group transition-colors disabled:opacity-50"
              >
                <span className="font-bold text-sm text-slate-700 group-hover:text-emerald-700">
                  {fav.name}
                </span>

                <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-emerald-500">
                  {Math.round(fav.calories)} kcal
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <textarea
        placeholder="Describe your meal here (e.g. 'Grilled Salmon & Quinoa'). You can also add a photo for AI analysis."
        value={description}
        onChange={(e) =>
          setDescription(e.target.value)
        }
        disabled={isAnalyzing}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none text-slate-800 placeholder-slate-400 disabled:opacity-60"
      />

      {/* Image preview */}
      {image && (
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          <img
            src={image}
            alt="Meal preview"
            className="w-full h-full object-cover"
          />

          <button
            onClick={() => setImage(null)}
            disabled={isAnalyzing}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full text-slate-700 hover:text-rose-500 shadow-sm transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
            Photo ready
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />

        <button
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={isAnalyzing}
          className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
          {image ? "Change Photo" : "Photo"}
        </button>

        <button
          onClick={analyzeAndLog}
          disabled={
            isAnalyzing ||
            (!description.trim() && !image)
          }
          className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analysing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze & Log
            </>
          )}
        </button>
      </div>

      {/* Small status message */}
      {isAnalyzing && (
        <p className="text-center text-xs text-slate-400">
          AI is analysing your meal. This may take a few seconds.
        </p>
      )}
    </div>
  );
}
