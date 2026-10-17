export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { json, error, paginated } from "@/lib/api-response";
import { withAuth, requireOrganisationAccess } from "@/lib/session";
import { sanitizeInput, validateProjectKey, validateProjectType, validateProjectStatus, FIELD_LIMITS } from "@/lib/validation";

export async function GET(req: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(req.url);
    const organisationId = searchParams.get("organisationId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const skip = (page - 1) * pageSize;

    // Scope every read to an organisation the user actually belongs to.
    let scopedOrgId = organisationId;
    if (scopedOrgId) {
      await requireOrganisationAccess(user.id, scopedOrgId);
    } else {
      const membership = await prisma.organisationMember.findFirst({
        where: { userId: user.id },
        select: { organisationId: true },
        orderBy: { createdAt: "asc" },
      });
      if (!membership) {
        return error("User is not a member of any organisation", 403);
      }
      scopedOrgId = membership.organisationId;
    }

    const where = { organisationId: scopedOrgId };

    const [items, total] = await Promise.all([
      prisma.project.findMany({
        skip,
        take: pageSize,
        where,
        include: { organisation: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.project.count({ where }),
    ]);

    return paginated(items, page, pageSize, total);
  });
}

export async function POST(req: Request) {
  return withAuth(async (user) => {
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

      // The organisation must be one the caller can actually join/manage.
      const orgId = organisationId;
      if (!orgId) {
        return error("organisationId is required", 400);
      }
      await requireOrganisationAccess(user.id, orgId);
      const finalOrgId = orgId;

      // Validate that referenced owners/managers/leads are members of the same org.
      const referencedIds = [businessOwnerId, projectManagerId, qaLeadId].filter(
        (id: string | undefined): id is string => Boolean(id),
      );
      if (referencedIds.length > 0) {
        const members = await prisma.organisationMember.findMany({
          where: { organisationId: finalOrgId, userId: { in: referencedIds } },
          select: { userId: true },
        });
        const memberSet = new Set(members.map((m) => m.userId));
        for (const id of referencedIds) {
          if (!memberSet.has(id)) {
            return error(`User ${id} is not a member of this organisation`, 400);
          }
        }
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

      try {
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
            organisationId: finalOrgId,
            businessOwnerId: businessOwnerId || null,
            projectManagerId: projectManagerId || null,
            qaLeadId: qaLeadId || null,
          },
        });
        return json(project, 201);
      } catch (err: unknown) {
        if (err && typeof err === "object" && "code" in err && (err as { code?: string; meta?: { target?: string[] } }).code === "P2002") {
          const e = err as { meta?: { target?: string[] } };
          if (e.meta?.target?.includes("key")) {
            return error(`Project key "${projKey}" is already used. Try a different key.`, 409);
          }
        }
        throw err;
      }
    } catch (err) {
      const status = (err as { status?: number })?.status ?? 500;
      const message = err instanceof Error ? err.message : "Failed to create project";
      if (status >= 500) console.error("POST /projects error:", err);
      return error(message, status);
    }
  });
}