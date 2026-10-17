import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import ProjectFilter from "./ProjectFilter";
import { Suspense } from "react";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const projectFilter = typeof searchParams?.project === "string" ? searchParams.project : undefined;
  const dateRange = typeof searchParams?.range === "string" ? searchParams.range : "7d";

  const where: any = {};
  const projectWhere: any = {};
  if (projectFilter) {
    where.projectId = projectFilter;
    projectWhere.id = projectFilter;
  }

  const [testCases, executions, defects, projects] = await Promise.all([
    prisma.testCase.findMany({ include: { steps: true }, where }),
    prisma.testExecution.findMany({ include: { stepResults: true }, where }),
    prisma.defect.findMany({ where }),
    prisma.project.findMany({ where: projectWhere }),
  ]);

  const totalCases = testCases.length;
  const totalExecutions = executions.length;
  const passed = executions.filter((e) => e.status === "PASSED").length;
  const failed = executions.filter((e) => e.status === "FAILED").length;
  const blocked = executions.filter((e) => e.status === "BLOCKED").length;
  const passRate = totalExecutions > 0 ? Math.round((passed / totalExecutions) * 100) : 0;

  const automatedExecutions = executions.filter((e) => e.stepResults && e.stepResults.length > 0);
  const automatedPassed = automatedExecutions.filter((e) => e.status === "PASSED").length;
  const automationPassRate = automatedExecutions.length > 0 ? Math.round((automatedPassed / automatedExecutions.length) * 100) : 0;

  const mappedCases = testCases.filter((tc) => tc.steps && tc.steps.length > 0).length;
  const mappingCoverage = totalCases > 0 ? Math.round((mappedCases / totalCases) * 100) : 0;

  const pipelineSuccess = totalExecutions > 0 ? Math.round((passed / totalExecutions) * 100) : 0;
  const openDefects = defects.filter((d) => d.status === "OPEN").length;

  const exitBadge = openDefects > 0
    ? "text-xs px-2 py-1 bg-[#FBE7E4] text-[#8F2A20] rounded"
    : "text-xs px-2 py-1 bg-[#E3F2EA] text-[#14633E] rounded";
  const gateBadge = passRate < 90
    ? "text-xs px-2 py-1 bg-[#FBEFD9] text-[#7A4600] rounded"
    : "text-xs px-2 py-1 bg-[#E3F2EA] text-[#14633E] rounded";

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumb="Home"
        title="Overview"
        description="One source of truth for test evidence."
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            <Suspense fallback={<div>Loading...</div>}>
              <ProjectFilter projects={projects} />
            </Suspense>
            <Link href="/test-cases" className="btn-primary">View Test Cases</Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/test-executions" className="bg-white border border-[#C9D0D8] rounded p-[28px] hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Manual pass rate</p>
          <p className="text-3xl font-semibold text-[#1B2430] mt-1">{totalExecutions > 0 ? passRate : 0}%</p>
          <p className="text-xs text-[#5B6675] mt-2">Passed ÷ total executions ({totalExecutions})</p>
        </Link>
        <Link href="/test-executions?automated=true" className="bg-white border border-[#C9D0D8] rounded p-[28px] hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Automation pass rate</p>
          <p className="text-3xl font-semibold text-[#1B2430] mt-1">{automatedExecutions.length > 0 ? automationPassRate : 0}%</p>
          <p className="text-xs text-[#5B6675] mt-2">Passed ÷ automated executions ({automatedExecutions.length})</p>
        </Link>
        <Link href="/test-cases" className="bg-white border border-[#C9D0D8] rounded p-[28px] hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Mapping coverage</p>
          <p className="text-3xl font-semibold text-[#1B2430] mt-1">{totalCases > 0 ? mappingCoverage : 0}%</p>
          <p className="text-xs text-[#5B6675] mt-2">Mapped ÷ test cases ({mappedCases}/{totalCases})</p>
        </Link>
        <Link href="/ci-cd" className="bg-white border border-[#C9D0D8] rounded p-[28px] hover:shadow-md transition-shadow">
          <p className="text-xs font-medium text-[#5B6675] uppercase tracking-wider">Pipeline success</p>
          <p className="text-3xl font-semibold text-[#1B2430] mt-1">{totalExecutions > 0 ? pipelineSuccess : 0}%</p>
          <p className="text-xs text-[#5B6675] mt-2">Successful ÷ total runs ({totalExecutions})</p>
        </Link>
      </div>
    </div>
  );
}
