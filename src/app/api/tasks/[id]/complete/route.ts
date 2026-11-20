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

  console.error("Failed to complete task", error);
  return Response.json(
    { error: "Could not save the task. Please try again.", code: "UNKNOWN" },
    { status: 500 },
  );
}

export async function POST(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const service = createPcsService(createAirtableRepository());
    const result = await service.completeTask(id);

    revalidatePath("/");
    if (result.batch) {
      revalidatePath(`/batches/${result.batch.id}`);
    }

    return Response.json(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
