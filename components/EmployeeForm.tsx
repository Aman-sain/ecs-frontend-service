"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Employee, EmployeeCreate } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, X } from "lucide-react";

interface EmployeeFormProps {
  employee?: Employee | null;
  onSubmit: (employee: EmployeeCreate) => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeCreate>({
    name: "",
    role: "",
    salary: 0,
    email: "",
    department: "",
    performance_rating: 0,
    skills: "",
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        role: employee.role,
        salary: employee.salary,
        email: employee.email || "",
        department: employee.department || "",
        performance_rating: employee.performance_rating || 0,
        skills: employee.skills || "",
      });
    }
  }, [employee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: "",
      role: "",
      salary: 0,
      email: "",
      department: "",
      performance_rating: 0,
      skills: "",
    });
  };

  const handleChange = (field: keyof EmployeeCreate) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: field === "salary" ? parseFloat(e.target.value) || 0 : e.target.value,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-2">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              <CardTitle className="text-2xl">
                {employee ? "Edit Employee" : "Add New Employee"}
              </CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            {employee
              ? "Update employee information below"
              : "Fill in the details to add a new employee"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange("name")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  value={formData.email}
                  onChange={handleChange("email")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Job Role *</Label>
                <Input
                  id="role"
                  placeholder="Software Engineer"
                  value={formData.role}
                  onChange={handleChange("role")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="Engineering"
                  value={formData.department}
                  onChange={handleChange("department")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Annual Salary (₹) *</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="1200000"
                  value={formData.salary === 0 ? "" : formData.salary}
                  onChange={handleChange("salary")}
                  min="0"
                  step="10000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="performance_rating">Performance (0-5)</Label>
                <Input
                  id="performance_rating"
                  type="number"
                  placeholder="4.5"
                  value={formData.performance_rating || ""}
                  onChange={handleChange("performance_rating")}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input
                id="skills"
                placeholder="React, TypeScript, Node.js"
                value={formData.skills}
                onChange={handleChange("skills")}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {employee ? "Update Employee" : "Add Employee"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
