"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Mail, IndianRupee } from "lucide-react";
import { Employee } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
}

export function EmployeeTable({ employees, onEdit, onDelete }: EmployeeTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">ID</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Salary</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                  No employees found. Add your first employee to get started.
                </td>
              </tr>
            ) : (
              employees.map((employee, index) => (
                <motion.tr
                  key={employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredRow(employee.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className="border-b hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                    #{employee.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{employee.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {employee.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {employee.department || (
                      <span className="text-muted-foreground italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {employee.email ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{employee.email}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 font-semibold">
                      <IndianRupee className="h-4 w-4 text-green-600 dark:text-green-400" />
                      {employee.salary.toLocaleString('en-IN')}
                    </div>
                    {employee.performance_rating && employee.performance_rating > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        ⭐ {employee.performance_rating.toFixed(1)}/5.0
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(employee)}
                        className="hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(employee.id)}
                        className="hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
