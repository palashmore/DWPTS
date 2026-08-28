using Microsoft.EntityFrameworkCore;
using DWPTS.Domain.Entities;
using DWPTS.Domain.Common;
using DWPTS.Application.Common;

namespace DWPTS.Infrastructure.Data;

public class DWPTSDbContext : DbContext
{
    private readonly ICurrentUserService? _currentUserService;

    public DWPTSDbContext(DbContextOptions<DWPTSDbContext> options, ICurrentUserService? currentUserService = null)
        : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<WorkItemType> WorkItemTypes => Set<WorkItemType>();
    public DbSet<WorkItem> WorkItems => Set<WorkItem>();
    public DbSet<WorkEntryCategory> WorkEntryCategories => Set<WorkEntryCategory>();
    public DbSet<MeetingType> MeetingTypes => Set<MeetingType>();
    public DbSet<Meeting> Meetings => Set<Meeting>();
    public DbSet<Holiday> Holidays => Set<Holiday>();
    public DbSet<LeaveType> LeaveTypes => Set<LeaveType>();
    public DbSet<EmployeeLeave> EmployeeLeaves => Set<EmployeeLeave>();
    public DbSet<WorkEntry> WorkEntries => Set<WorkEntry>();
    public DbSet<WorkEntryRemark> WorkEntryRemarks => Set<WorkEntryRemark>();
    public DbSet<WorkItemHistory> WorkItemHistories => Set<WorkItemHistory>();
    public DbSet<DailySummary> DailySummaries => Set<DailySummary>();
    public DbSet<RecurringWorkTemplate> RecurringWorkTemplates => Set<RecurringWorkTemplate>();
    public DbSet<ImportJob> ImportJobs => Set<ImportJob>();
    public DbSet<ImportJobDetail> ImportJobDetails => Set<ImportJobDetail>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().HasKey(u => u.UserId);
        modelBuilder.Entity<Role>().HasKey(r => r.RoleId);
        modelBuilder.Entity<Employee>().HasKey(e => e.EmployeeId);
        modelBuilder.Entity<WorkItemType>().HasKey(w => w.WorkItemTypeId);
        modelBuilder.Entity<WorkItem>().HasKey(w => w.WorkItemId);
        modelBuilder.Entity<WorkEntryCategory>().HasKey(w => w.CategoryId);
        modelBuilder.Entity<MeetingType>().HasKey(w => w.MeetingTypeId);
        modelBuilder.Entity<Meeting>().HasKey(w => w.MeetingId);
        modelBuilder.Entity<Holiday>().HasKey(w => w.HolidayId);
        modelBuilder.Entity<LeaveType>().HasKey(w => w.LeaveTypeId);
        modelBuilder.Entity<EmployeeLeave>().HasKey(w => w.EmployeeLeaveId);
        modelBuilder.Entity<WorkEntry>().HasKey(w => w.WorkEntryId);
        modelBuilder.Entity<WorkEntryRemark>().HasKey(w => w.RemarkId);
        modelBuilder.Entity<WorkItemHistory>().HasKey(w => w.HistoryId);
        modelBuilder.Entity<DailySummary>().HasKey(w => w.DailySummaryId);
        modelBuilder.Entity<RecurringWorkTemplate>().HasKey(w => w.TemplateId);
        modelBuilder.Entity<ImportJob>().HasKey(w => w.ImportJobId);
        modelBuilder.Entity<ImportJobDetail>().HasKey(w => w.DetailId);
        modelBuilder.Entity<AuditLog>().HasKey(w => w.AuditLogId);
        modelBuilder.Entity<SystemSetting>().HasKey(w => w.SettingId);
        modelBuilder.Entity<Notification>().HasKey(w => w.NotificationId);

        // UserRole Composite Key
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId);

        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId);

        // Employee self-referencing Manager
        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Manager)
            .WithMany(m => m.Subordinates)
            .HasForeignKey(e => e.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        // User -> Employee 1:1
        modelBuilder.Entity<User>()
            .HasOne(u => u.Employee)
            .WithOne(e => e.User)
            .HasForeignKey<User>(u => u.EmployeeId)
            .OnDelete(DeleteBehavior.SetNull);

        // EmployeeLeave
        modelBuilder.Entity<EmployeeLeave>(b =>
        {
            b.HasOne(l => l.Employee)
                .WithMany(e => e.Leaves)
                .HasForeignKey(l => l.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(l => l.Approver)
                .WithMany()
                .HasForeignKey(l => l.ApproverId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // WorkEntry configuration
        modelBuilder.Entity<WorkEntry>(b =>
        {
            b.HasIndex(w => w.WorkDate);
            b.HasIndex(w => w.EmployeeId);
            b.HasIndex(w => w.TaskNumber);
            b.HasIndex(w => w.CategoryId);
            b.HasIndex(w => w.MeetingId);
            b.HasIndex(w => w.Status);

            b.Property(w => w.PlannedEffortHours).HasPrecision(18, 2);
            b.Property(w => w.MeetingEffortHours).HasPrecision(18, 2);
            b.Property(w => w.WorkEffortHours).HasPrecision(18, 2);
            b.Property(w => w.TotalEffortHours).HasPrecision(18, 2);

            b.HasOne(w => w.Employee)
                .WithMany(e => e.WorkEntries)
                .HasForeignKey(w => w.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(w => w.WorkItem)
                .WithMany(wi => wi.WorkEntries)
                .HasForeignKey(w => w.WorkItemId)
                .OnDelete(DeleteBehavior.SetNull);

            b.HasOne(w => w.Category)
                .WithMany(c => c.WorkEntries)
                .HasForeignKey(w => w.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            b.HasOne(w => w.Meeting)
                .WithMany(m => m.WorkEntries)
                .HasForeignKey(w => w.MeetingId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // WorkItem
        modelBuilder.Entity<WorkItem>(b =>
        {
            b.HasIndex(w => w.WorkItemNumber).IsUnique();
            b.HasIndex(w => w.Status);
        });

        // DailySummary
        modelBuilder.Entity<DailySummary>(b =>
        {
            b.HasIndex(d => new { d.EmployeeId, d.SummaryDate }).IsUnique();

            b.Property(d => d.CapacityHours).HasPrecision(18, 2);
            b.Property(d => d.PlannedHours).HasPrecision(18, 2);
            b.Property(d => d.MeetingHours).HasPrecision(18, 2);
            b.Property(d => d.WorkHours).HasPrecision(18, 2);
            b.Property(d => d.TotalEffortHours).HasPrecision(18, 2);
            b.Property(d => d.VarianceHours).HasPrecision(18, 2);
            b.Property(d => d.OvertimeHours).HasPrecision(18, 2);
            b.Property(d => d.UtilizationPercentage).HasPrecision(18, 2);
        });

        // Global query filter for soft delete across related entities
        modelBuilder.Entity<User>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Employee>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<WorkItem>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<WorkEntry>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<WorkEntryCategory>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Meeting>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Holiday>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<EmployeeLeave>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<DailySummary>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Notification>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<RecurringWorkTemplate>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<WorkEntryRemark>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<WorkItemHistory>().HasQueryFilter(e => !e.IsDeleted);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();
        var currentUsername = _currentUserService?.Username ?? "System";

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
                entry.Entity.CreatedBy = currentUsername;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
                entry.Entity.UpdatedBy = currentUsername;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
