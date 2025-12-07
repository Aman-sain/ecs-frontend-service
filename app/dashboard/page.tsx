"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { EmployeeTable } from "@/components/EmployeeTable";
import { EmployeeForm } from "@/components/EmployeeForm";
import { BulkImport } from "@/components/BulkImport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { employeeAPI, Employee, EmployeeCreate } from "@/lib/api";
import { UserPlus, Search, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState({
    total_employees: 0,
    average_salary: 0,
    growth_rate: 0,
    departments: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeAPI.getAll({ search: searchQuery });
      setEmployees(data.employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to fetch employees. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await employeeAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchStats();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchEmployees();
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleAddOrUpdate = async (employee: EmployeeCreate) => {
    try {
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.id, employee);
      } else {
        await employeeAPI.create(employee);
      }
      await fetchEmployees();
      await fetchStats();
      setShowForm(false);
      setEditingEmployee(null);
    } catch (error: any) {
      console.error("Error saving employee:", error);
      alert(error.response?.data?.detail || "Failed to save employee");
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    try {
      await employeeAPI.delete(id);
      await fetchEmployees();
      await fetchStats();
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-muted-foreground">
              Manage your workforce efficiently and effectively
            </p>
          </div>

          <StatsCards stats={stats} />

          <div className="mb-6">
            <BulkImport onSuccess={() => { fetchEmployees(); fetchStats(); }} />
          </div>

          {showForm && (
            <div className="mb-8">
              <EmployeeForm
                employee={editingEmployee}
                onSubmit={handleAddOrUpdate}
                onCancel={handleCancel}
              />
            </div>
          )}

          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  fetchEmployees();
                  fetchStats();
                }}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {!showForm && (
                <Button onClick={() => setShowForm(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              )}
            </div>
          </div>

          <EmployeeTable
            employees={employees}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </motion.div>
      </main>
    </div>
  );
}
