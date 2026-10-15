export const UserRolesEnum = {
    ADMIN: "admin",
    CUSTOMER: "customer",
};

export const UserRoles = Object.values(UserRolesEnum);

const TaskStatusEnum = {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
};

export const AvailableTaskStatus = Object.values(TaskStatusEnum);
