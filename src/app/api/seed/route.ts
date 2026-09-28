import { NextResponse } from "next/server";
import { seedDemoData } from "@/db/seed";

export async function POST() {
  try {
    await seedDemoData();
    return NextResponse.json({
      success: true,
      message: "Demo health documents and datasets seeded successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Seeding failed" },
      { status: 500 },
    );
  }
}
