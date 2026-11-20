import { revalidatePath } from "next/cache";
import { createAirtableRepository } from "@/lib/airtable/airtable-repository";
import {
  AirtableConfigError,
  AirtableRequestError,
  PcsError,
} from "@/lib/pcs/errors";
import { createPcsService } from "@/lib/pcs/service";

type Context = { params: Promise<{ id: string }> };

function toErrorResponse(error: unknown): Response {
  if (error instanceof PcsError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.status },
    );
  }

  if (error instanceof AirtableConfigError) {
    return Response.json(
      { error: error.message, code: "AIRTABLE_CONFIG" },
      { status: 500 },
    );
  }

  if (error instanceof AirtableRequestError) {
    return Response.json(
      { error: error.message, code: "AIRTABLE_ERROR" },
      { status: 502 },
    );
  }

  console.error("Failed to start batch", error);
  return Response.json(
    { error: "Could not start the batch. Please try again.", code: "UNKNOWN" },
    { status: 500 },
  );
}

export async function POST(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const service = createPcsService(createAirtableRepository());
    const batch = await service.startBatch(id);

    revalidatePath("/");
    revalidatePath(`/batches/${id}`);

    return Response.json({ batch });
  } catch (error) {
    return toErrorResponse(error);
  }
}
