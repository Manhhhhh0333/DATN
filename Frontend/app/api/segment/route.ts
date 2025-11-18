import { NextRequest, NextResponse } from "next/server";

let jiebaLoaded = false;
let jiebaModule: any = null;

async function loadJieba() {
  if (jiebaLoaded && jiebaModule) {
    return jiebaModule;
  }

  try {
    const jieba = await import("@node-rs/jieba");
    if (typeof jieba.load === "function") {
      jieba.load();
    }
    jiebaModule = jieba;
    jiebaLoaded = true;
    return jieba;
  } catch (error) {
    console.error("Failed to load jieba:", error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required and must be a string" },
        { status: 400 }
      );
    }

    const jieba = await loadJieba();
    let segments: string[] = [];
    
    if (typeof jieba.cut === "function") {
      segments = jieba.cut(text, true);
    } else if (jieba.default && typeof jieba.default.cut === "function") {
      segments = jieba.default.cut(text, true);
    } else {
      throw new Error("Jieba cut method not found");
    }

    return NextResponse.json({
      text,
      segments,
      count: segments.length,
    });
  } catch (error: any) {
    console.error("Segment error:", error);
    return NextResponse.json(
      {
        error: "Failed to segment text",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

