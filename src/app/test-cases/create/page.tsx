import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import TestCaseCreateForm from "../test-case-create-form";
import Link from "next/link";

export default async function CreateTestCasePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const [projects, users, testSuites] = await Promise.all([
    prisma.project.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.testSuite.findMany({ include: { testPlan: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        breadcrumb="Test Cases / Create"
        title="Create Test Case"
        description="Define a new test case with steps, expected results, and execution tracking."
        actions={
          <Link href="/test-cases" className="btn-outline">Back to Test Cases</Link>
        }
      />

      {projects.length === 0 && (
        <div className="bg-[#FBE7E4] border border-[#C9D0D8] rounded p-4">
          <p className="text-sm text-[#8F2A20]">
            You must create a project before you can create test cases. Go to{" "}
            <Link href="/projects" className="text-[#1F6F8B] hover:underline font-medium">Projects</Link>
            to create one.
          </p>
        </div>
      )}

      {projects.length > 0 && (
        <div className="bg-white border border-[#C9D0D8] rounded-lg p-[28px]">
          <TestCaseCreateForm
            projects={projects}
            users={users}
            testSuites={testSuites}
            noProjects={null}
          />
        </div>
      )}
    </div>
  );
}
