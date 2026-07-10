import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { generateBackupSql } from "@/lib/backup";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const { sql, filename } = await generateBackupSql();
    return new NextResponse(sql, {
      status: 200,
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Backup failed" }, { status: 500 });
  }
}
