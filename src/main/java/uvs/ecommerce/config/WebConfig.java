package uvs.ecommerce.config;

import org.springframework.context.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class WebConfig {
    // CORS is configured centrally in uvs.ecommerce.security.SecurityConfig (shared with the Spring Security filter chain).
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
}


