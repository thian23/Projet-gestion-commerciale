package uvs.ecommerce.security;

import uvs.ecommerce.enums.Role;

public record AuthenticatedUser(Long id, String email, Role role) {}
