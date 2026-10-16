import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { sanitizeInput, validateProjectKey, validateProjectType, validateProjectStatus, FIELD_LIMITS } from "@/lib/validation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      skip,
      take: pageSize,
      include: { organisation: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.count(),
  ]);

  return paginated(items, page, pageSize, total);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      key,
      description,
      objectives,
      product,
      projectType,
      methodology,
      riskClassification,
      requirementsSource,
      defaultTemplates,
      inScopeAreas,
      outOfScopeAreas,
      startDate,
      targetDate,
      status,
      organisationId,
      businessOwnerId,
      projectManagerId,
      qaLeadId,
    } = body;

    if (!name || String(name).trim().length === 0) {
      return error("Project name is required", 400);
    }

    const projKey = (key || "")
      .toString()
      .trim()
      .toUpperCase() || String(name)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6) || "PRJ";

    const keyValidation = validateProjectKey(projKey);
    if (!keyValidation.valid) {
      return error(keyValidation.error!, 400);
    }

    const existingKey = await prisma.project.findUnique({ where: { key: projKey } });
    if (existingKey) {
      return error(`Project key "${projKey}" is already used. Try a different key.`, 409);
    }

    if (projectType) {
      const typeValidation = validateProjectType(String(projectType));
      if (!typeValidation.valid) {
        return error(typeValidation.error!, 400);
      }
    }

    if (status) {
      const statusValidation = validateProjectStatus(String(status));
      if (!statusValidation.valid) {
        return error(statusValidation.error!, 400);
      }
    }

    let orgId = organisationId;
    if (!orgId) {
      const org = await prisma.organisation.findFirst();
      if (!org) {
        const created = await prisma.organisation.create({ data: { name: "Default Workspace" } });
        orgId = created.id;
      } else {
        orgId = org.id;
      }
    }

    const project = await prisma.project.create({
      data: {
        key: projKey,
        name: sanitizeInput(String(name)).slice(0, FIELD_LIMITS.title),
        description: description ? sanitizeInput(String(description)).slice(0, FIELD_LIMITS.description) : null,
        objectives: objectives ? sanitizeInput(String(objectives)).slice(0, FIELD_LIMITS.objective) : null,
        product: product ? sanitizeInput(String(product)).slice(0, FIELD_LIMITS.title) : null,
        projectType: projectType || null,
        methodology: methodology ? sanitizeInput(String(methodology)) : null,
        riskClassification: riskClassification ? sanitizeInput(String(riskClassification)) : null,
        requirementsSource: requirementsSource ? sanitizeInput(String(requirementsSource)) : null,
        defaultTemplates: defaultTemplates ? sanitizeInput(String(defaultTemplates)) : null,
        inScopeAreas: inScopeAreas ? sanitizeInput(String(inScopeAreas)).slice(0, FIELD_LIMITS.description) : null,
        outOfScopeAreas: outOfScopeAreas ? sanitizeInput(String(outOfScopeAreas)).slice(0, FIELD_LIMITS.description) : null,
        startDate: startDate ? new Date(startDate) : null,
        targetDate: targetDate ? new Date(targetDate) : null,
        status: status || "DRAFT",
        organisationId: orgId,
        businessOwnerId: businessOwnerId || null,
        projectManagerId: projectManagerId || null,
        qaLeadId: qaLeadId || null,
      },
    });
    return json(project, 201);
  } catch {
    return error("Failed to create project", 500);
  }
}
