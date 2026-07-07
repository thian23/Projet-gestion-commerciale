package uvs.ecommerce.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import uvs.ecommerce.enums.Role;

import java.util.Optional;

public final class SecurityUtils {
    private SecurityUtils() {}

    public static Optional<AuthenticatedUser> currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof AuthenticatedUser user)) {
            return Optional.empty();
        }
        return Optional.of(user);
    }

    public static AuthenticatedUser requireCurrentUser() {
        return currentUser().orElseThrow(() -> new AccessDeniedException("Authentification requise"));
    }

    public static boolean isAdmin() {
        return currentUser().map(u -> u.role() == Role.ADMIN).orElse(false);
    }

    public static void requireAdmin() {
        if (!isAdmin()) throw new AccessDeniedException("Reserve aux administrateurs");
    }
}
