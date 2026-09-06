export function isAdminEmail(
    email: string | null | undefined
): boolean {
    if (!email) {
        return false;
    }

    const adminEmail =
        process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!adminEmail) {
        return false;
    }

    return (
        email.trim().toLowerCase() ===
        adminEmail.trim().toLowerCase()
    );
}