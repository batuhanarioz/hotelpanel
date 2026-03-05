"use client";

import { useAdminUsers } from "@/hooks/useAdminUsers";
import { UserRole } from "@/types/database";
import { UserListTable } from "@/app/components/admin/UserListTable";
import { CreateUserModal } from "@/app/components/admin/CreateUserModal";
import { EditUserModal } from "@/app/components/admin/EditUserModal";
import { ResetPasswordModal } from "@/app/components/admin/ResetPasswordModal";
import { ChangePasswordModal } from "@/app/components/ChangePasswordModal";
import { DeleteUserModal } from "@/app/components/DeleteUserModal";
import { DashboardChecklistModal } from "@/app/components/DashboardChecklistModal";
import { WorkingHoursModal } from "@/app/components/admin/WorkingHoursModal";
import { useState } from "react";
import { PermissionMatrix } from "@/app/components/admin/PermissionMatrix";
import { RolesManagement } from "@/app/components/admin/RolesManagement";
import { ActivityLogView } from "@/app/components/admin/ActivityLogView";
import { HotelSettingsView } from "@/app/components/admin/hotel/HotelSettingsView";

export default function AdminUsersPage() {
  const {
    users, loading, error, isAdmin, currentUserId,
    showCreateModal, setShowCreateModal, showEditModal, setShowEditModal, selectedUser,
    showPasswordModal, setShowPasswordModal, deleteTarget, setDeleteTarget, deleteProtected,
    showResetModal, setShowResetModal, setResetUserId, showChecklistModal, setShowChecklistModal,
    saving, newEmail, setNewEmail, newFullName, setNewFullName, newPassword, setNewPassword, newRole, setNewRole,
    newDepartment, setNewDepartment,
    newMaxRefundLimit, setNewMaxRefundLimit, newMaxDiscountLimit, setNewMaxDiscountLimit,
    editFullName, setEditFullName, editRole, setEditRole,
    editDepartment, setEditDepartment, editIsActive, setEditIsActive, editFinancialLimit, setEditFinancialLimit,
    editMaxRefundLimit, setEditMaxRefundLimit, editMaxDiscountLimit, setEditMaxDiscountLimit,
    editTwoFactorEnabled, setEditTwoFactorEnabled, editIpRestriction, setEditIpRestriction,
    editSaving,
    resetPassword, setResetPassword, resetSaving, resetError, resetSuccess, setResetSuccess,
    handleCreateUser, handleUpdateUser, handleResetPassword, executeDeleteUser, openEditModal, openDeleteModal
  } = useAdminUsers();

  const [showWorkingHoursModal, setShowWorkingHoursModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "permissions" | "logs" | "hotel">("users");

  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const departmentsCount = [...new Set(users.map(u => u.department).filter(Boolean))].length;
  const last24hLogins = users.filter(u => u.last_login && new Date(u.last_login) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Actions Section */}
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Users */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm transition-all hover:border-slate-300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-100 italic-none">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
              </div>
              <div className="italic-none">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Toplam Ekip</p>
                <p className="text-base font-black text-slate-900 leading-none">{totalUsers}</p>
              </div>
            </div>
          </div>
          {/* Active Users */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm transition-all hover:border-slate-300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 italic-none">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
              </div>
              <div className="italic-none">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Aktif Üyeler</p>
                <p className="text-base font-black text-slate-900 leading-none">{activeUsers}</p>
              </div>
            </div>
          </div>
          {/* Departments */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm transition-all hover:border-slate-300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 italic-none">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 21V5.25A2.25 2.25 0 0 0 17.25 3H6.75A2.25 2.25 0 0 0 4.5 5.25V21m3-3h3m-3-3h3m-3-3h3m-3-3h3m6.75 12h-3m3-3h-3m3-3h-3m3-3h-3M4 21h16" /></svg>
              </div>
              <div className="italic-none">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Departmanlar</p>
                <p className="text-base font-black text-slate-900 leading-none">{departmentsCount}</p>
              </div>
            </div>
          </div>
          {/* Logins 24h */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm transition-all hover:border-slate-300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 italic-none">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              </div>
              <div className="italic-none">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">24s Giriş</p>
                <p className="text-base font-black text-slate-900 leading-none">{last24hLogins}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tab Navigation */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl max-w-full overflow-x-auto whitespace-nowrap scrollbar-hide italic-none gap-1 sm:gap-0">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "users" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Kullanıcılar
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "roles" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Roller
            </button>
            <button
              onClick={() => setActiveTab("permissions")}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "permissions" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Yetki Matrisi
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "logs" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Aktivite Logları
            </button>
            <button
              onClick={() => setActiveTab("hotel")}
              className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === "hotel" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Otel Yapılandırması
            </button>
          </div>

          {isAdmin && activeTab === "users" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[48px] px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-100/50 hover:shadow-teal-200/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group italic-none"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-sm font-black tracking-tight whitespace-nowrap">Yeni Üye Ekle</span>
            </button>
          )}
        </div>
      </div>

      <section className="rounded-3xl border bg-white shadow-sm overflow-hidden italic-none min-h-[400px]">
        {activeTab === "users" && (
          <UserListTable
            users={users}
            loading={loading}
            isAdmin={isAdmin}
            currentUserId={currentUserId}
            onEditUser={openEditModal}
          />
        )}
        {activeTab === "roles" && (
          <RolesManagement onEditPermissions={() => setActiveTab('permissions')} />
        )}
        {activeTab === "permissions" && <PermissionMatrix />}
        {activeTab === "logs" && <ActivityLogView />}
        {activeTab === "hotel" && <HotelSettingsView />}
      </section>

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
        saving={saving}
        error={error}
        email={newEmail}
        setEmail={setNewEmail}
        fullName={newFullName}
        setFullName={setNewFullName}
        password={newPassword}
        setPassword={setNewPassword}
        role={newRole as UserRole}
        setRole={setNewRole}
        department={newDepartment}
        setDepartment={setNewDepartment}
        maxRefundLimit={newMaxRefundLimit}
        setMaxRefundLimit={setNewMaxRefundLimit}
        maxDiscountLimit={newMaxDiscountLimit}
        setMaxDiscountLimit={setNewMaxDiscountLimit}
        isSuperAdmin={isAdmin}
      />

      <EditUserModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateUser}
        saving={editSaving}
        error={error}
        user={selectedUser as never}
        fullName={editFullName}
        setFullName={setEditFullName}
        role={editRole as UserRole}
        setRole={setEditRole}
        department={editDepartment}
        setDepartment={setEditDepartment}
        isActive={editIsActive}
        setIsActive={setEditIsActive}
        financialLimit={editFinancialLimit}
        setFinancialLimit={setEditFinancialLimit}
        maxRefundLimit={editMaxRefundLimit}
        setMaxRefundLimit={setEditMaxRefundLimit}
        maxDiscountLimit={editMaxDiscountLimit}
        setMaxDiscountLimit={setEditMaxDiscountLimit}
        twoFactorEnabled={editTwoFactorEnabled}
        setTwoFactorEnabled={setEditTwoFactorEnabled}
        ipRestriction={editIpRestriction}
        setIpRestriction={setEditIpRestriction}
        isSuperAdmin={isAdmin}
        currentUserId={currentUserId}
        onResetPassword={() => {
          setResetUserId(selectedUser?.id || null);
          setResetSuccess(false);
          setShowResetModal(true);
        }}
        onDeleteUser={() => selectedUser && openDeleteModal(selectedUser as never)}
        onChangePassword={() => setShowPasswordModal(true)}
      />

      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}
        saving={resetSaving}
        error={resetError}
        success={resetSuccess}
        password={resetPassword}
        setPassword={setResetPassword}
      />

      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <DeleteUserModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDeleteUser}
        userName={deleteTarget?.full_name ?? null}
        userEmail={deleteTarget?.email ?? null}
        isProtected={deleteProtected}
      />

      <DashboardChecklistModal
        open={showChecklistModal}
        onClose={() => setShowChecklistModal(false)}
      />

      <WorkingHoursModal
        isOpen={showWorkingHoursModal}
        onClose={() => setShowWorkingHoursModal(false)}
      />
    </div>
  );
}
