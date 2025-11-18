"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CharacterDetailView from "@/components/character/CharacterDetailView";
import { CharacterData, characterService } from "@/lib/services/characterService";

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const character = decodeURIComponent(params.character as string);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacterData();
  }, [character]);

  const loadCharacterData = async () => {
    try {
      setLoading(true);
      // Chỉ load nếu là bộ thủ đơn (1 ký tự)
      if (character.length !== 1) {
        console.log("Character không phải bộ thủ đơn:", character);
        setCharacterData(null);
        return;
      }
      const data = await characterService.getCharacter(character);
      if (data) {
        setCharacterData(data);
      } else {
        setCharacterData(null);
      }
    } catch (error) {
      console.error("Error loading character data:", error);
      setCharacterData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!characterData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <div className="text-gray-500 text-lg">
              {character.length === 1 
                ? `Không tìm thấy bộ thủ "${character}" trong danh sách 214 bộ thủ`
                : `"${character}" không phải là bộ thủ đơn. Chỉ có thể xem chi tiết bộ thủ đơn (1 ký tự).`}
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quay lại
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <CharacterDetailView character={character} data={characterData} />
      </main>
      <Footer />
    </div>
  );
}
