export const UserRolesEnum = {
    ADMIN: "admin",
    PROJECT_ADMIN: "project_admin",
    USER: "user",
};

export const UserRoles = Object.values(UserRolesEnum);

const TaskStatusEnum = {
    PENDING: "pending",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
};

export const AvailableTaskStatus = Object.values(TaskStatusEnum);
