"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download } from "lucide-react";
import { employeeAPI } from "@/lib/api";

interface BulkImportProps {
  onSuccess: () => void;
}

export function BulkImport({ onSuccess }: BulkImportProps) {
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    try {
      const blob = await employeeAPI.exportCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employees.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export employees');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').slice(1);
      const employees = lines
        .filter(line => line.trim())
        .map(line => {
          const [, name, email, role, department, salary] = line.split(',');
          return {
            name: name?.trim(),
            role: role?.trim(),
            department: department?.trim(),
            email: email?.trim() || undefined,
            salary: parseFloat(salary),
          };
        })
        .filter(emp => emp.name && emp.role && emp.salary);

      const result = await employeeAPI.bulkCreate(employees);
      alert(`Created ${result.created} employees. ${result.errors.length} errors.`);
      onSuccess();
    } catch (error) {
      alert('Failed to import employees');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Operations</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <label>
          <Button variant="outline" disabled={importing} asChild>
            <span>
              <Upload className="h-4 w-4 mr-2" />
              {importing ? "Importing..." : "Import CSV"}
            </span>
          </Button>
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </CardContent>
    </Card>
  );
}
