// app/api/auth/revoke/route.ts
import { NextRequest, NextResponse } from "next/server";
import UserAuthToken from "@/models/auth.model";
import { connectDB } from "@/lib/db";

await connectDB();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { access_token, user_id } = body;

    if (!access_token) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const authToken = await UserAuthToken.findOne({
      access_token,
      user_id: user_id.toString(),
    });

    if (!authToken) {
      return NextResponse.json(
        { error: "Token not found or already revoked" },
        { status: 404 }
      );
    }

    if (authToken.logout_time) {
      return NextResponse.json(
        { error: "Token already revoked" },
        { status: 400 }
      );
    }

    authToken.logout_time = new Date();
    authToken.updated_date = new Date();
    authToken.updated_by = authToken.user_name || "SYSTEM";
    await authToken.save();

    return NextResponse.json({
      success: true,
      message: "Token revoked successfully",
      revoked_at: authToken.logout_time,
    });
  } catch (error) {
    console.error("Revoke error:", error);
    return NextResponse.json(
      { error: "Token revocation failed" },
      { status: 500 }
    );
  }
}
