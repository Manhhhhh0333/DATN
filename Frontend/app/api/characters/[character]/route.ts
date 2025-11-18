import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: { character: string } }
) {
  try {
    const character = decodeURIComponent(params.character);
    const filePath = path.join(process.cwd(), "public", "data", "214_bo_thu_from_pdf.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Character data file not found" }, { status: 404 });
    }
    const fileContents = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContents);
    
    const characterData = data[character];
    if (!characterData) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }
    
    return NextResponse.json(characterData);
  } catch (error) {
    console.error("Error reading character data:", error);
    return NextResponse.json({ error: "Failed to load character data" }, { status: 500 });
  }
}
